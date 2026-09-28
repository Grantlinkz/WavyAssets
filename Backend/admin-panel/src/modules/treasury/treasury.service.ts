import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { EventsGateway } from '../events/events.gateway';
import { ApproveDepositDto } from './dto/approve-deposit.dto';
import { RejectDepositDto } from './dto/reject-deposit.dto';
import { SignOffWithdrawalDto, SignOffAction } from './dto/sign-off-withdrawal.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { TreasuryQueryDto } from './dto/treasury-query.dto';

const FINMA_DUAL_SIGNOFF_THRESHOLD = 100000.0;

@Injectable()
export class TreasuryService {
  private readonly logger = new Logger(TreasuryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly eventsGateway: EventsGateway,
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

    const [total, transactions] = await Promise.all([
      this.prisma.ledgerTransaction.count({ where }),
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

    let totalPendingAmountUsd = 0;
    const items = transactions.map((tx) => {
      const amt = Number(tx.amount);
      totalPendingAmountUsd += amt;

      const userEntry = tx.entries.find((e) => e.account?.user);
      const user = userEntry?.account?.user || null;

      return {
        id: tx.id,
        referenceId: tx.referenceId,
        amount: amt,
        currency: tx.currency,
        rail: tx.rail || 'SWISS_SIC',
        counterparty: tx.counterparty || 'Institutional Depositor',
        accountNumber: tx.accountNumber || 'CH93 0023 8812 4019 8821 0',
        description: tx.description,
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
      },
    };
  }

  /**
   * 1-Click Approve & Credit Balance for inbound deposit
   */
  async approveDeposit(txId: string, adminId?: string, dto?: ApproveDepositDto) {
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

    const amount = Number(tx.amount);
    const currency = (tx.currency || 'USD').toUpperCase();

    const result = await this.prisma.$transaction(async (prismaTx) => {
      // 1. Resolve recipient user
      let userId: string | null = null;
      let existingAccount = tx.entries.find((e) => e.account)?.account || null;

      if (existingAccount) {
        userId = existingAccount.userId;
      } else {
        // Look up by account number or fallback to user matching reference or first active user
        if (tx.accountNumber) {
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
          const fallbackUser = await prismaTx.user.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          });
          if (fallbackUser) userId = fallbackUser.id;
        }
      }

      if (!userId) {
        throw new BadRequestException(
          `Unable to attribute deposit '${txId}' to an institutional client user.`,
        );
      }

      // 2. Fetch or create user's AVAILABLE_CASH ledger account
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
      const newBalance = previousBalance + amount;

      // 3. Update account balance
      const updatedAccount = await prismaTx.ledgerAccount.update({
        where: { id: userAccount.id },
        data: { balance: newBalance },
      });

      // 4. Create LedgerEntry credit if not present
      if (tx.entries.length === 0) {
        await prismaTx.ledgerEntry.create({
          data: {
            transactionId: tx.id,
            accountId: updatedAccount.id,
            amount: amount,
          },
        });
      }

      // 5. Transition transaction status to SETTLED
      const settledTx = await prismaTx.ledgerTransaction.update({
        where: { id: tx.id },
        data: { status: 'SETTLED' },
      });

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
          ipAddressHash: this.cryptoService.hashIpAddress('127.0.0.1'),
        },
      });

      return {
        id: settledTx.id,
        referenceId: settledTx.referenceId,
        status: settledTx.status,
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

    return result;
  }

  /**
   * Rejects an unverified inbound deposit
   */
  async rejectDeposit(txId: string, adminId?: string, dto?: RejectDepositDto) {
    const tx = await this.prisma.ledgerTransaction.findUnique({
      where: { id: txId },
    });

    if (!tx) {
      throw new NotFoundException(`Deposit transaction '${txId}' was not found.`);
    }

    if (tx.status !== 'PENDING') {
      throw new ConflictException(
        `Transaction '${txId}' is in status '${tx.status}' and cannot be rejected.`,
      );
    }

    const result = await this.prisma.$transaction(async (prismaTx) => {
      const updatedTx = await prismaTx.ledgerTransaction.update({
        where: { id: txId },
        data: { status: 'FAILED' },
      });

      await prismaTx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'DEPOSIT_REJECT',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: 'PENDING' }),
          diffAfter: JSON.stringify({ status: 'FAILED', reason: dto?.reason }),
          reason: dto?.reason || 'Deposit rejected due to unverified receipt or mismatching memo',
          ipAddressHash: this.cryptoService.hashIpAddress('127.0.0.1'),
        },
      });

      return {
        id: updatedTx.id,
        referenceId: updatedTx.referenceId,
        status: updatedTx.status,
        reason: dto?.reason,
      };
    });

    this.logger.warn(`Deposit '${txId}' rejected by officer ${adminId || 'SYSTEM'}: ${dto?.reason}`);

    this.eventsGateway.emitSettlementUpdate({
      txId: result.id,
      type: 'DEPOSIT_REJECTED',
      status: 'FAILED',
    });

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

    const [total, transactions] = await Promise.all([
      this.prisma.ledgerTransaction.count({ where }),
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
    const items = transactions.map((tx) => {
      const amt = Number(tx.amount);
      totalPendingWithdrawalsAmountUsd += amt;

      const userEntry = tx.entries.find((e) => e.account?.user);
      const user = userEntry?.account?.user || null;
      const txSignOffs = signOffsByTx.get(tx.id) || [];
      const requiresDualSignOff = amt > FINMA_DUAL_SIGNOFF_THRESHOLD;

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

    // Check existing sign-offs for this withdrawal
    const existingSignOffs = await this.prisma.treasurySignOff.findMany({
      where: { withdrawalId: txId },
    });

    const alreadySigned = existingSignOffs.some((so) => so.officerId === adminId);
    if (alreadySigned) {
      throw new ConflictException(
        'Officer has already signed off on this withdrawal. FINMA AMLA Article 14 strictly mandates sign-off from a distinct authorized officer.',
      );
    }

    const amount = Number(tx.amount);
    const requiresDualSignOff = amount > FINMA_DUAL_SIGNOFF_THRESHOLD;

    return await this.prisma.$transaction(async (prismaTx) => {
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
        if (existingSignOffs.length === 0) {
          // First sign-off recorded
          nextStatus = 'PENDING_SECOND_SIGN_OFF';
          isFullySettled = false;
        } else {
          // Second distinct sign-off recorded
          nextStatus = 'SETTLED';
          isFullySettled = true;
        }
      }

      // 2. Update transaction status
      const updatedTx = await prismaTx.ledgerTransaction.update({
        where: { id: tx.id },
        data: { status: nextStatus },
      });

      // 3. Record Audit Log
      await prismaTx.adminAuditLog.create({
        data: {
          adminId,
          action: 'WITHDRAWAL_SIGNOFF',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: tx.status, signOffCount: existingSignOffs.length }),
          diffAfter: JSON.stringify({
            status: nextStatus,
            signOffCount: existingSignOffs.length + 1,
            isFullySettled,
            notes: dto.notes,
          }),
          reason: `FINMA AMLA sign-off recorded by officer. Status transitioned to ${nextStatus}`,
          ipAddressHash: this.cryptoService.hashIpAddress('127.0.0.1'),
        },
      });

      this.logger.log(
        `Withdrawal '${txId}' sign-off by officer ${adminId}: status=${nextStatus} (Sign-offs: ${existingSignOffs.length + 1}/${requiresDualSignOff ? 2 : 1})`,
      );

      // Broadcast update
      this.eventsGateway.emitSettlementUpdate({
        txId: tx.id,
        type: 'WITHDRAWAL_SIGNOFF',
        status: nextStatus,
        isFullySettled,
        amount,
        currency: tx.currency,
      });

      return {
        id: updatedTx.id,
        referenceId: updatedTx.referenceId,
        amount,
        currency: updatedTx.currency,
        status: updatedTx.status,
        requiresDualSignOff,
        signOffCount: existingSignOffs.length + 1,
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
  }

  /**
   * Rejects an outbound withdrawal and refunds reserved capital to client balance
   */
  async rejectAndRefundWithdrawal(
    txId: string,
    adminId?: string,
    dto?: RejectWithdrawalDto,
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

    if (tx.status !== 'PENDING' && tx.status !== 'PENDING_SECOND_SIGN_OFF') {
      throw new ConflictException(
        `Withdrawal '${txId}' is in status '${tx.status}' and cannot be rejected or refunded.`,
      );
    }

    const amount = Number(tx.amount);
    const currency = (tx.currency || 'USD').toUpperCase();

    const result = await this.prisma.$transaction(async (prismaTx) => {
      // 1. Mark transaction as FAILED
      const updatedTx = await prismaTx.ledgerTransaction.update({
        where: { id: tx.id },
        data: { status: 'FAILED' },
      });

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

      let refunded = false;
      let newBalance = 0;

      if (userAccount) {
        const prevBal = Number(userAccount.balance);
        newBalance = prevBal + amount;

        await prismaTx.ledgerAccount.update({
          where: { id: userAccount.id },
          data: { balance: newBalance },
        });

        // Create compensatory credit entry
        await prismaTx.ledgerEntry.create({
          data: {
            transactionId: tx.id,
            accountId: userAccount.id,
            amount: amount,
          },
        });

        refunded = true;
      }

      // 3. Record Audit Log
      await prismaTx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: 'WITHDRAWAL_REJECT_REFUND',
          targetEntity: 'LedgerTransaction',
          targetId: tx.id,
          diffBefore: JSON.stringify({ status: tx.status }),
          diffAfter: JSON.stringify({
            status: 'FAILED',
            refunded,
            refundedAmount: amount,
            newBalance,
            reason: dto?.reason,
          }),
          reason: dto?.reason || 'Withdrawal rejected and reserved capital refunded by compliance officer',
          ipAddressHash: this.cryptoService.hashIpAddress('127.0.0.1'),
        },
      });

      return {
        id: updatedTx.id,
        referenceId: updatedTx.referenceId,
        status: updatedTx.status,
        refunded,
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

    return result;
  }
}
