import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EmailService } from '../../common/services/email.service';
import { EventsGateway } from '../events/events.gateway';
import { ApproveDepositDto } from './dto/approve-deposit.dto';
import { RejectDepositDto } from './dto/reject-deposit.dto';
import { SignOffWithdrawalDto, SignOffAction } from './dto/sign-off-withdrawal.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { TreasuryQueryDto } from './dto/treasury-query.dto';

const FINMA_DUAL_SIGNOFF_THRESHOLD = 100000.0;

const FX_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  CHF: 1.12,
  USDC: 1.0,
  BTC: 88500.0,
  ETH: 3150.0,
};

@Injectable()
export class TreasuryService {
  private readonly logger = new Logger(TreasuryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly eventsGateway: EventsGateway,
    @Optional() private readonly emailService?: EmailService,
  ) {}


  /**
   * Retrieves pending inbound deposits requiring treasury receipt verification
   */
  async getPendingDeposits(query: TreasuryQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      type: 'DEPOSIT',
      status: 'PENDING',
    };

    if (query.rail && query.rail !== 'ALL') {
      where.rail = query.rail;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { referenceId: { contains: term } },
        { description: { contains: term } },
        { counterparty: { contains: term } },
        { accountNumber: { contains: term } },
      ];
    }

    // Backfill any zero/null amounts on LedgerTransaction from their ledger entry
    try {
      await this.prisma.$executeRawUnsafe(`
        UPDATE "LedgerTransaction" lt
        SET "amount" = ABS(le."amount")
        FROM "LedgerEntry" le
        WHERE lt."id" = le."transactionId"
          AND (lt."amount" IS NULL OR lt."amount" = 0)
          AND le."amount" != 0
      `);
    } catch {
      // Continue gracefully if engine restricts update
    }

    const [total, pendingGrouped, transactions] = await Promise.all([
      this.prisma.ledgerTransaction.count({ where }),
      this.prisma.ledgerTransaction.groupBy
        ? this.prisma.ledgerTransaction.groupBy({
            by: ['currency'],
            where,
            _sum: { amount: true },
          })
        : Promise.resolve([]),
      this.prisma.ledgerTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          entries: {
            include: {
              account: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      fullName: true,
                      tier: true,
                      kycTier: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Query recent deposit receipt audit logs
    const receiptAuditLogs = typeof (this.prisma as any).auditLog?.findMany === 'function'
      ? await (this.prisma as any).auditLog.findMany({
          where: { action: 'DEPOSIT_RECEIPT_UPLOAD' },
          orderBy: { createdAt: 'desc' },
          take: 200,
        })
      : [];

    const receiptsByTx = new Map<string, { receiptUrl?: string; txHash?: string; senderName?: string; senderBank?: string }>();
    for (const log of receiptAuditLogs) {
      try {
        if (!log.metadata) continue;
        const meta = JSON.parse(log.metadata);
        if (meta.transactionId && !receiptsByTx.has(meta.transactionId)) {
          receiptsByTx.set(meta.transactionId, meta);
        }
        if (meta.referenceId && !receiptsByTx.has(meta.referenceId)) {
          receiptsByTx.set(meta.referenceId, meta);
        }
      } catch {
        // Continue gracefully on JSON parse error
      }
    }

    let totalPendingAmountUsd = 0;
    const pendingByCurrency: Record<string, number> = {};

    const items = transactions.map((tx) => {
      const positiveEntry = tx.entries.find((e) => Number(e.amount) > 0);
      const entryAmt = positiveEntry ? Math.abs(Number(positiveEntry.amount)) : 0;
      const amt = Number(tx.amount) > 0 ? Number(tx.amount) : entryAmt;
      const cur = (tx.currency || 'USD').toUpperCase();

      pendingByCurrency[cur] = (pendingByCurrency[cur] || 0) + amt;
      const rate = FX_TO_USD[cur] ?? 1.0;
      totalPendingAmountUsd += amt * rate;

      const userEntry = tx.entries.find((e) => e.account?.user);
      const user = userEntry?.account?.user || null;
      const receiptMeta = receiptsByTx.get(tx.id) || receiptsByTx.get(tx.referenceId);

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        amount: amt,
        currency: tx.currency || 'USD',
        rail: tx.rail || 'SWISS_SIC',
        counterparty: receiptMeta?.senderName || tx.counterparty || 'Institutional Depositor',
        accountNumber: receiptMeta?.senderBank || tx.accountNumber || 'CH93 0023 8812 4019 8821 0',
        description: tx.description,
        proofReceiptUrl: receiptMeta?.receiptUrl || null,
        txHash: receiptMeta?.txHash || null,
        status: tx.status,
        createdAt: tx.createdAt,
        user: user
          ? {
              id: user.id,
              email: user.email,
              fullName: user.fullName || 'Institutional Client',
              tier: user.tier,
              kycTier: user.kycTier,
            }
          : null,
      };
    });


    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalPendingCount: total,
        totalPendingAmountUsd,
        pendingByCurrency,
      },
    };
  }

  /**
   * 1-Click Approve & Credit Balance for inbound deposit
   */
  async approveDeposit(
    txId: string,
    adminId?: string,
    dto?: ApproveDepositDto,
    ipAddress?: string,
  ) {
    const tx = await this.prisma.ledgerTransaction.findUnique({
      where: { id: txId },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!tx) {
      throw new NotFoundException(`Deposit transaction '${txId}' was not found.`);
    }

    if (tx.type !== 'DEPOSIT') {
      throw new BadRequestException(`Transaction '${txId}' is not a deposit transaction (type: ${tx.type}).`);
    }

    if (tx.status !== 'PENDING') {
      throw new ConflictException(
        `Transaction '${txId}' is already in status '${tx.status}' and cannot be approved again.`,
      );
    }

    const positiveEntry = tx.entries.find((e) => Number(e.amount) > 0);
    const entryAmt = positiveEntry ? Math.abs(Number(positiveEntry.amount)) : 0;
    const amount = Number(tx.amount) > 0 ? Number(tx.amount) : entryAmt;
    const currency = (tx.currency || 'USD').toUpperCase();

    const result = await this.prisma.$transaction(async (prismaTx) => {
      // 1. Transition transaction status to SETTLED conditionally before balance credit
      const updatedTx = await prismaTx.ledgerTransaction.updateMany({
        where: { id: tx.id, type: 'DEPOSIT', status: 'PENDING' },
        data: {
          status: 'SETTLED',
          amount,
        },
      });

      if (updatedTx.count !== 1) {
        throw new ConflictException(
          `Deposit transaction '${txId}' is no longer in PENDING status or has been modified.`,
        );
      }

      // 2. Resolve recipient user
      let userId: string | null = null;
      const existingAccount = tx.entries.find((e) => e.account)?.account || null;

      if (existingAccount) {
        userId = existingAccount.userId;
      } else if (tx.accountNumber) {
        const matchedUser = await prismaTx.user.findFirst({
          where: {
            OR: [
              { id: tx.accountNumber },
              { email: tx.accountNumber },
            ],
          },
        });
        if (matchedUser) userId = matchedUser.id;
      }

      if (!userId) {
        throw new BadRequestException(
          `Unable to attribute deposit '${txId}' to an institutional client user.`,
        );
      }

      // 3. Fetch or create user's AVAILABLE_CASH ledger account
      let userAccount = await prismaTx.ledgerAccount.findUnique({
        where: {
          userId_accountType_currency: {
            userId,
            accountType: 'AVAILABLE_CASH',
            currency,
          },
        },
      });

      if (!userAccount) {
        userAccount = await prismaTx.ledgerAccount.create({
          data: {
            userId,
            accountType: 'AVAILABLE_CASH',
            currency,
            balance: 0.0,
          },
        });
      }

      const previousBalance = Number(userAccount.balance);

      // 4. Update account balance atomically
      const updatedAccount = await prismaTx.ledgerAccount.update({
        where: { id: userAccount.id },
        data: {
          balance: { increment: amount },
        },
      });
      const newBalance = Number(updatedAccount.balance);

      // 5. Create LedgerEntry credit if not present
      if (tx.entries.length === 0) {
        await prismaTx.ledgerEntry.create({
          data: {
            transactionId: tx.id,
            accountId: updatedAccount.id,
            amount: amount,
          },
        });
      }

      // 6. Record Audit Log
      await prismaTx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'DEPOSIT_APPROVE',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: 'PENDING', balance: previousBalance }),
          diffAfter: JSON.stringify({
            status: 'SETTLED',
            balance: newBalance,
            creditedAmount: amount,
            notes: dto?.notes || null,
          }),
          reason: dto?.notes || 'Inbound wire/crypto receipt confirmed and credited by treasury officer',
          ipAddressHash: this.cryptoService.hashIpAddress(ipAddress || '127.0.0.1'),
        },
      });

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        status: 'SETTLED',
        amount,
        currency,
        creditedAccountId: updatedAccount.id,
        userId,
        previousBalance,
        newBalance,
        settledAt: new Date().toISOString(),
      };
    });

    this.logger.log(
      `Deposit '${txId}' (${amount} ${currency}) approved and credited by officer ${adminId || 'SYSTEM'}`,
    );

    // Broadcast real-time update
    this.eventsGateway.emitSettlementUpdate({
      txId: result.id,
      type: 'DEPOSIT_APPROVED',
      amount: result.amount,
      currency: result.currency,
      status: 'SETTLED',
    });

    // Dispatch institutional email notification to client
    if (result.userId && this.emailService) {
      this.prisma.user
        .findUnique({ where: { id: result.userId } })
        .then((user) => {
          if (user?.email) {
            this.emailService?.sendDepositNotification({
              toEmail: user.email,
              userFullName: user.fullName ?? undefined,
              amount: result.amount,
              currency: result.currency,
              referenceId: result.referenceId,
              rail: tx.rail || 'SWISS_SIC',
              status: 'APPROVED',
              newBalance: result.newBalance,
              timestamp: new Date(),
            });
          }
        })
        .catch((e) => this.logger.warn(`Failed to dispatch deposit approved email: ${e?.message}`));
    }

    return result;
  }

  /**
   * Rejects an unverified inbound deposit
   */
  async rejectDeposit(
    txId: string,
    adminId?: string,
    dto?: RejectDepositDto,
    ipAddress?: string,
  ) {
    const tx = await this.prisma.ledgerTransaction.findUnique({
      where: { id: txId },
      include: {
        entries: {
          include: {
            account: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!tx) {
      throw new NotFoundException(`Deposit transaction '${txId}' was not found.`);
    }

    if (tx.type !== 'DEPOSIT') {
      throw new BadRequestException(`Transaction '${txId}' is not a deposit transaction (type: ${tx.type}).`);
    }

    if (tx.status !== 'PENDING') {
      throw new ConflictException(
        `Transaction '${txId}' is in status '${tx.status}' and cannot be rejected.`,
      );
    }

    const result = await this.prisma.$transaction(async (prismaTx) => {
      const updatedTx = await prismaTx.ledgerTransaction.updateMany({
        where: { id: txId, type: 'DEPOSIT', status: 'PENDING' },
        data: { status: 'FAILED' },
      });

      if (updatedTx.count !== 1) {
        throw new ConflictException(
          `Transaction '${txId}' is in status '${tx.status}' and cannot be rejected.`,
        );
      }

      await prismaTx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'DEPOSIT_REJECT',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: 'PENDING' }),
          diffAfter: JSON.stringify({ status: 'FAILED', reason: dto?.reason }),
          reason: dto?.reason || 'Deposit rejected due to unverified receipt or mismatching memo',
          ipAddressHash: this.cryptoService.hashIpAddress(ipAddress || '127.0.0.1'),
        },
      });

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        status: 'FAILED',
        reason: dto?.reason,
      };
    });

    this.logger.warn(`Deposit '${txId}' rejected by officer ${adminId || 'SYSTEM'}: ${dto?.reason}`);

    this.eventsGateway.emitSettlementUpdate({
      txId: result.id,
      type: 'DEPOSIT_REJECTED',
      status: 'FAILED',
    });

    // Dispatch institutional email notification to client
    if (this.emailService) {
      this.resolveUserForTx(tx)
        .then((user: { id: string; email: string; fullName: string | null } | null) => {
          if (user?.email) {
            this.emailService?.sendDepositNotification({
              toEmail: user.email,
              userFullName: user.fullName ?? undefined,
              amount: Number(tx.amount),
              currency: tx.currency || 'USD',
              referenceId: tx.referenceId,
              rail: tx.rail || 'SWISS_SIC',
              status: 'REJECTED',
              reason: dto?.reason,
              timestamp: new Date(),
            });
          }
        })
        .catch((e: any) => this.logger.warn(`Failed to dispatch deposit rejected email: ${e?.message}`));
    }

    return result;
  }


  /**
   * Retrieves pending outbound withdrawals requiring treasury clearance
   */
  async getPendingWithdrawals(query: TreasuryQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      type: 'WITHDRAWAL',
      status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] },
    };

    if (query.rail && query.rail !== 'ALL') {
      where.rail = query.rail;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { referenceId: { contains: term } },
        { description: { contains: term } },
        { counterparty: { contains: term } },
        { accountNumber: { contains: term } },
      ];
    }

    const [total, pendingGrouped, transactions] = await Promise.all([
      this.prisma.ledgerTransaction.count({ where }),
      this.prisma.ledgerTransaction.groupBy
        ? this.prisma.ledgerTransaction.groupBy({
            by: ['currency'],
            where,
            _sum: { amount: true },
          })
        : Promise.resolve([]),
      this.prisma.ledgerTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          entries: {
            include: {
              account: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      fullName: true,
                      tier: true,
                      kycTier: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Fetch all sign-offs for these transactions
    const txIds = transactions.map((t) => t.id);
    const signOffs = txIds.length > 0
      ? await this.prisma.treasurySignOff.findMany({
          where: { withdrawalId: { in: txIds } },
          include: {
            officer: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        })
      : [];

    const signOffsByTx = new Map<string, typeof signOffs>();
    for (const so of signOffs) {
      const existing = signOffsByTx.get(so.withdrawalId) || [];
      existing.push(so);
      signOffsByTx.set(so.withdrawalId, existing);
    }

    let totalPendingWithdrawalsAmountUsd = 0;
    const pendingWithdrawalsByCurrency: Record<string, number> = {};

    if (pendingGrouped.length > 0) {
      for (const group of pendingGrouped) {
        const cur = (group.currency || 'USD').toUpperCase();
        const sum = Number(group._sum.amount || 0);
        pendingWithdrawalsByCurrency[cur] = sum;
        const rate = FX_TO_USD[cur] ?? 1.0;
        totalPendingWithdrawalsAmountUsd += sum * rate;
      }
    } else {
      for (const tx of transactions) {
        const amt = Number(tx.amount || 0);
        const cur = (tx.currency || 'USD').toUpperCase();
        pendingWithdrawalsByCurrency[cur] = (pendingWithdrawalsByCurrency[cur] || 0) + amt;
        const rate = FX_TO_USD[cur] ?? 1.0;
        totalPendingWithdrawalsAmountUsd += amt * rate;
      }
    }

    const items = transactions.map((tx) => {
      const amt = Number(tx.amount);

      const userEntry = tx.entries.find((e) => e.account?.user);
      const user = userEntry?.account?.user || null;
      const txSignOffs = signOffsByTx.get(tx.id) || [];
      const cur = (tx.currency || 'USD').toUpperCase();
      const rate = cur === 'USD' ? 1.0 : FX_TO_USD[cur];
      const amtInUsd = rate !== undefined ? amt * rate : Infinity;
      const requiresDualSignOff = amtInUsd > FINMA_DUAL_SIGNOFF_THRESHOLD;

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        amount: amt,
        currency: tx.currency,
        rail: tx.rail || 'SWISS_SIC',
        counterparty: tx.counterparty || 'Institutional Client',
        accountNumber: tx.accountNumber || 'CH93 0023 8812 4019 8821 0',
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
        requiresDualSignOff,
        signOffCount: txSignOffs.length,
        requiredSignOffsCount: requiresDualSignOff ? 2 : 1,
        signOffs: txSignOffs.map((so) => ({
          id: so.id,
          officerId: so.officerId,
          officerName: so.officer.fullName,
          officerRole: so.officer.role,
          action: so.action,
          notes: so.notes,
          signedAt: so.signedAt,
        })),
        user: user
          ? {
              id: user.id,
              email: user.email,
              fullName: user.fullName || 'Institutional Client',
              tier: user.tier,
              kycTier: user.kycTier,
            }
          : null,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalPendingWithdrawalsCount: total,
        totalPendingWithdrawalsAmountUsd,
        pendingByCurrency: pendingWithdrawalsByCurrency,
      },
    };
  }

  /**
   * FINMA AMLA Article 14 Dual Sign-Off Engine for Outbound Withdrawals
   */
  async signOffWithdrawal(
    txId: string,
    adminId: string,
    dto: SignOffWithdrawalDto,
    ipAddress?: string,
  ) {
    if (!adminId) {
      throw new BadRequestException('Officer ID is mandatory for treasury sign-off.');
    }

    const tx = await this.prisma.ledgerTransaction.findUnique({
      where: { id: txId },
    });

    if (!tx) {
      throw new NotFoundException(`Withdrawal transaction '${txId}' was not found.`);
    }

    if (tx.type !== 'WITHDRAWAL') {
      throw new BadRequestException(`Transaction '${txId}' is not a withdrawal (type: ${tx.type}).`);
    }

    if (tx.status !== 'PENDING' && tx.status !== 'PENDING_SECOND_SIGN_OFF') {
      throw new ConflictException(
        `Withdrawal '${txId}' is in status '${tx.status}' and cannot be signed off.`,
      );
    }

    const cur = (tx.currency || 'USD').toUpperCase();
    const rate = cur === 'USD' ? 1.0 : FX_TO_USD[cur];
    const amountInUsd = rate !== undefined ? Number(tx.amount) * rate : Infinity;
    const requiresDualSignOff = amountInUsd > FINMA_DUAL_SIGNOFF_THRESHOLD;

    // Handle rejection before sign-off creation so rejected requests cannot settle
    if (dto?.action === SignOffAction.REJECT) {
      await this.rejectAndRefundWithdrawal(
        txId,
        adminId,
        { reason: dto.notes || 'Withdrawal rejected during sign-off' },
        ipAddress,
      );
      return {
        withdrawalId: tx.id,
        referenceId: tx.referenceId,
        amount: Number(tx.amount),
        currency: tx.currency,
        status: 'FAILED',
        requiresDualSignOff,
        signOffCount: 0,
        requiredSignOffsCount: requiresDualSignOff ? 2 : 1,
        isFullySettled: false,
        currentSignOff: {
          id: `so-rej-${tx.id}`,
          officerId: adminId,
          signedAt: new Date(),
          notes: dto.notes || null,
        },
      };
    }

    const result = await this.prisma.$transaction(async (prismaTx) => {
      // Check existing sign-offs for this withdrawal inside transaction
      const existingSignOffs = await prismaTx.treasurySignOff.findMany({
        where: { withdrawalId: txId },
      });

      const alreadySigned = existingSignOffs.some((so) => so.officerId === adminId);
      if (alreadySigned) {
        throw new ConflictException(
          'Officer has already signed off on this withdrawal. FINMA AMLA Article 14 strictly mandates sign-off from a distinct authorized officer.',
        );
      }

      const approveSignOffs = existingSignOffs.filter(
        (so) => so.action === SignOffAction.APPROVE || !so.action,
      );

      // 1. Create TreasurySignOff record
      const signOff = await prismaTx.treasurySignOff.create({
        data: {
          withdrawalId: tx.id,
          officerId: adminId,
          action: dto.action || SignOffAction.APPROVE,
          notes: dto.notes || null,
        },
      });

      let nextStatus = tx.status;
      let isFullySettled = false;

      if (!requiresDualSignOff) {
        // Small withdrawal (<= $100k): Single sign-off settles payout immediately
        nextStatus = 'SETTLED';
        isFullySettled = true;
      } else {
        // Large withdrawal (> $100k): FINMA AMLA Article 14 dual sign-off
        if (approveSignOffs.length === 0) {
          // First sign-off recorded
          nextStatus = 'PENDING_SECOND_SIGN_OFF';
          isFullySettled = false;
        } else {
          // Second distinct sign-off recorded
          nextStatus = 'SETTLED';
          isFullySettled = true;
        }
      }

      // 2. Conditionally update transaction status
      const updatedTx = await prismaTx.ledgerTransaction.updateMany({
        where: {
          id: tx.id,
          type: 'WITHDRAWAL',
          status: tx.status,
        },
        data: { status: nextStatus },
      });

      if (updatedTx.count !== 1) {
        throw new ConflictException(
          `Withdrawal '${txId}' status has changed concurrently.`,
        );
      }

      // 3. Record Audit Log
      await prismaTx.adminAuditLog.create({
        data: {
          adminId,
          action: 'WITHDRAWAL_SIGNOFF',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: tx.status, signOffCount: approveSignOffs.length }),
          diffAfter: JSON.stringify({
            status: nextStatus,
            signOffCount: approveSignOffs.length + 1,
            isFullySettled,
            notes: dto.notes,
          }),
          reason: `FINMA AMLA sign-off recorded by officer. Status transitioned to ${nextStatus}`,
          ipAddressHash: this.cryptoService.hashIpAddress(ipAddress || '127.0.0.1'),
        },
      });

      return {
        withdrawalId: tx.id,
        referenceId: tx.referenceId,
        amount: Number(tx.amount),
        currency: tx.currency,
        status: nextStatus,
        requiresDualSignOff,
        signOffCount: approveSignOffs.length + 1,
        requiredSignOffsCount: requiresDualSignOff ? 2 : 1,
        isFullySettled,
        currentSignOff: {
          id: signOff.id,
          officerId: signOff.officerId,
          signedAt: signOff.signedAt,
          notes: signOff.notes,
        },
      };
    });

    this.logger.log(
      `Withdrawal '${txId}' sign-off by officer ${adminId}: status=${result.status} (Sign-offs: ${result.signOffCount}/${result.requiredSignOffsCount})`,
    );

    // Broadcast update only after commit
    this.eventsGateway.emitSettlementUpdate({
      txId: result.withdrawalId,
      type: 'WITHDRAWAL_SIGNOFF',
      status: result.status,
      isFullySettled: result.isFullySettled,
      amount: result.amount,
      currency: result.currency,
    });

    // Dispatch institutional email notification to client if fully settled
    if (result.isFullySettled && this.emailService) {
      this.resolveUserForTx(tx)
        .then((user: { id: string; email: string; fullName: string | null } | null) => {
          if (user?.email) {
            this.emailService!.sendWithdrawalNotification({
              toEmail: user.email,
              userFullName: user.fullName ?? undefined,
              amount: result.amount,
              currency: result.currency || 'USD',
              referenceId: result.referenceId,
              rail: tx.rail || 'SWISS_SIC',
              status: 'APPROVED',
              destination: (tx.accountNumber || tx.counterparty) ?? undefined,
              timestamp: new Date(),
            });
          }
        })
        .catch((e: any) => this.logger.warn(`Failed to dispatch withdrawal approved email: ${e?.message}`));
    }

    return result;
  }

  /**
   * Rejects an outbound withdrawal and refunds reserved capital to client balance
   */
  async rejectAndRefundWithdrawal(
    txId: string,
    adminId?: string,
    dto?: RejectWithdrawalDto,
    ipAddress?: string,
  ) {
    const tx = await this.prisma.ledgerTransaction.findUnique({
      where: { id: txId },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!tx) {
      throw new NotFoundException(`Withdrawal transaction '${txId}' was not found.`);
    }

    if (tx.type !== 'WITHDRAWAL') {
      throw new BadRequestException(`Transaction '${txId}' is not a withdrawal (type: ${tx.type}).`);
    }

    if (tx.status !== 'PENDING' && tx.status !== 'PENDING_SECOND_SIGN_OFF') {
      throw new ConflictException(
        `Withdrawal '${txId}' is in status '${tx.status}' and cannot be rejected or refunded.`,
      );
    }

    const amount = Number(tx.amount);
    const currency = (tx.currency || 'USD').toUpperCase();

    const result = await this.prisma.$transaction(async (prismaTx) => {
      // 1. Conditionally mark transaction as FAILED
      const updatedTx = await prismaTx.ledgerTransaction.updateMany({
        where: {
          id: tx.id,
          type: 'WITHDRAWAL',
          status: { in: ['PENDING', 'PENDING_SECOND_SIGN_OFF'] },
        },
        data: { status: 'FAILED' },
      });

      if (updatedTx.count !== 1) {
        throw new ConflictException(
          `Withdrawal '${txId}' is in status '${tx.status}' and cannot be rejected or refunded.`,
        );
      }

      // 2. Locate user's debit entry or account to refund
      let userAccount = tx.entries.find((e) => e.account)?.account || null;

      if (!userAccount && tx.accountNumber) {
        userAccount = await prismaTx.ledgerAccount.findFirst({
          where: {
            accountType: 'AVAILABLE_CASH',
            currency,
            user: {
              OR: [
                { id: tx.accountNumber },
                { email: tx.accountNumber },
              ],
            },
          },
        });
      }

      if (!userAccount) {
        throw new BadRequestException(
          `Unable to resolve user ledger account to refund withdrawal '${txId}'.`,
        );
      }

      // 3. Atomically refund reserved capital
      const updatedAccount = await prismaTx.ledgerAccount.update({
        where: { id: userAccount.id },
        data: {
          balance: { increment: amount },
        },
      });
      const newBalance = Number(updatedAccount.balance);

      // Create compensatory credit entry
      await prismaTx.ledgerEntry.create({
        data: {
          transactionId: tx.id,
          accountId: userAccount.id,
          amount: amount,
        },
      });

      // 4. Record Audit Log
      await prismaTx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'WITHDRAWAL_REJECT_REFUND',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: tx.status }),
          diffAfter: JSON.stringify({
            status: 'FAILED',
            refunded: true,
            refundedAmount: amount,
            newBalance,
            reason: dto?.reason,
          }),
          reason: dto?.reason || 'Withdrawal rejected and reserved capital refunded by compliance officer',
          ipAddressHash: this.cryptoService.hashIpAddress(ipAddress || '127.0.0.1'),
        },
      });

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        status: 'FAILED',
        refunded: true,
        refundedAmount: amount,
        currency,
        newBalance,
        reason: dto?.reason,
      };
    });

    this.logger.warn(
      `Withdrawal '${txId}' rejected and refunded by officer ${adminId || 'SYSTEM'}: ${dto?.reason}`,
    );

    this.eventsGateway.emitSettlementUpdate({
      txId: result.id,
      type: 'WITHDRAWAL_REJECTED_REFUNDED',
      status: 'FAILED',
      refundedAmount: amount,
    });

    // Dispatch institutional email notification to client
    if (this.emailService) {
      this.resolveUserForTx(tx)
        .then((user: { id: string; email: string; fullName: string | null } | null) => {
          if (user?.email) {
            this.emailService!.sendWithdrawalNotification({
              toEmail: user.email,
              userFullName: user.fullName ?? undefined,
              amount: result.refundedAmount,
              currency: result.currency || 'USD',
              referenceId: tx.referenceId,
              rail: tx.rail || 'SWISS_SIC',
              status: 'REJECTED',
              destination: (tx.accountNumber || tx.counterparty) ?? undefined,
              reason: dto?.reason,
              newBalance: result.newBalance,
              timestamp: new Date(),
            });
          }
        })
        .catch((e: any) => this.logger.warn(`Failed to dispatch withdrawal rejected email: ${e?.message}`));
    }

    return result;
  }

  /**
   * Helper to resolve the user associated with a ledger transaction
   */
  private async resolveUserForTx(
    tx: any,
  ): Promise<{ id: string; email: string; fullName: string | null } | null> {
    if (tx.entries && tx.entries.length > 0) {
      const userEntry = tx.entries.find((e: any) => e.account?.user);
      if (userEntry?.account?.user) return userEntry.account.user;
    }

    if (tx.accountNumber) {
      const matched = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: tx.accountNumber }, { email: tx.accountNumber }],
        },
      });
      if (matched) return matched;
    }

    const entry = await this.prisma.ledgerEntry.findFirst({
      where: { transactionId: tx.id },
      include: {
        account: {
          include: { user: true },
        },
      },
    });

    return entry?.account?.user || null;
  }
}


