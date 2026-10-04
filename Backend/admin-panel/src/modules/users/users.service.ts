import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Logger,
  Optional,
} from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../../common/services/prisma.service";
import { CryptoService } from "../../common/services/crypto.service";
import { EmailService } from "../../common/services/email.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { EmailUserDto } from "./dto/email-user.dto";
import { FundBalanceDto, BalanceFundDirection } from "./dto/fund-balance.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { Resend } from "resend";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly resendClient: Resend | null = null;
  private readonly emailFrom: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    @Optional() private readonly emailService?: EmailService,
  ) {
    const resendApiKey = process.env.RESEND_API_KEY || "";
    if (resendApiKey && resendApiKey.startsWith("re_")) {
      this.resendClient = new Resend(resendApiKey);
      this.logger.log("Resend email client successfully initialized.");
    } else {
      this.logger.warn(
        "[Resend Config] RESEND_API_KEY is not configured or invalid (must start with re_).",
      );
    }

    const rawFrom =
      process.env.EMAIL_FROM || "WavyAssets Security <security@wavyassets.com>";
    if (!rawFrom.includes("@")) {
      const sanitizedName = rawFrom.replace(/["']/g, "").trim();
      this.emailFrom = `${sanitizedName} <onboarding@resend.dev>`;
    } else {
      this.emailFrom = rawFrom.replace(/["']/g, "").trim();
    }
  }

  /**
   * Retrieves paginated directory of Supreme users with aggregated balances
   */
  async findAll(query: UserQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search query: ID, Email, or FullName
    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { email: { contains: s } },
        { fullName: { contains: s } },
        { id: { contains: s } },
      ];
    }

    // Tier filtering
    if (query.tier && query.tier !== "ALL") {
      const normalizedTier = query.tier.toUpperCase().replace(/\s+/g, "_");
      if (normalizedTier.includes("TIER_1")) {
        where.kycTier = "TIER_1";
      } else if (normalizedTier.includes("TIER_2")) {
        where.kycTier = "TIER_2";
      } else if (normalizedTier.includes("TIER_3")) {
        where.kycTier = "TIER_3";
      } else if (normalizedTier.includes("INSTITUTIONAL")) {
        where.tier = "INSTITUTIONAL";
      } else {
        where.tier = query.tier;
      }
    }

    if (query.kycTier) {
      where.kycTier = query.kycTier;
    }

    // Status filtering
    if (query.status && query.status !== "ALL") {
      const s = query.status.toLowerCase();
      if (s === "active") {
        where.isActive = true;
      } else if (s === "locked" || s === "suspended") {
        where.isActive = false;
      }
    }

    const [total, users, totalActive, totalLocked, totalInstitutional] =
      await Promise.all([
        this.prisma.user.count({ where }),
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            ledgerAccounts: true,
            vipCard: {
              select: {
                cardNumberLast4: true,
                tier: true,
                isFrozen: true,
              },
            },
            _count: {
              select: {
                sessions: true,
                kycDocuments: true,
              },
            },
          },
        }),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isActive: false } }),
        this.prisma.user.count({ where: { tier: "INSTITUTIONAL" } }),
      ]);

    // Format and aggregate balances for each user
    const items = users.map((user) => {
      let availableCash = 0;
      let investedCapital = 0;

      for (const account of user.ledgerAccounts) {
        const bal = Number(account.balance);
        if (account.accountType === "AVAILABLE_CASH") {
          availableCash += bal;
        } else if (account.accountType === "INVESTED_CAPITAL") {
          investedCapital += bal;
        }
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName || "Anonymous Institutional Entity",
        tier: user.tier,
        kycTier: user.kycTier,
        isCorporate: user.isCorporate,
        isActive: user.isActive,
        status: user.isActive ? "Active" : "Locked",
        availableCash,
        investedCapital,
        totalBalance: availableCash + investedCapital,
        activeSessionsCount: user._count.sessions,
        kycDocumentsCount: user._count.kycDocuments,
        vipCard: user.vipCard || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summaryStats: {
        totalClients: totalActive + totalLocked,
        activeEntities: totalActive,
        lockedAccounts: totalLocked,
        institutionalTier: totalInstitutional,
      },
    };
  }

  /**
   * Retrieves full institutional dossier for an individual client
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ledgerAccounts: {
          include: {
            entries: {
              take: 10,
              orderBy: { createdAt: "desc" },
              include: {
                transaction: true,
              },
            },
          },
        },
        kycDocuments: {
          orderBy: { uploadedAt: "desc" },
        },
        vipCard: true,
        sessions: {
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${id}' was not found.`,
      );
    }

    let availableCash = 0;
    let investedCapital = 0;

    for (const account of user.ledgerAccounts) {
      const bal = Number(account.balance);
      if (account.accountType === "AVAILABLE_CASH") {
        availableCash += bal;
      } else if (account.accountType === "INVESTED_CAPITAL") {
        investedCapital += bal;
      }
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || "Institutional Client",
      tier: user.tier,
      kycTier: user.kycTier,
      isCorporate: user.isCorporate,
      isActive: user.isActive,
      status: user.isActive ? "Active" : "Locked",
      balances: {
        availableCash,
        investedCapital,
        totalBalance: availableCash + investedCapital,
        accounts: user.ledgerAccounts.map((acc) => ({
          id: acc.id,
          accountType: acc.accountType,
          currency: acc.currency,
          balance: Number(acc.balance),
          recentEntries: acc.entries.map((e) => ({
            id: e.id,
            amount: Number(e.amount),
            createdAt: e.createdAt,
            transaction: e.transaction,
          })),
        })),
      },
      kycDocuments: user.kycDocuments,
      vipCard: user.vipCard,
      activeSessions: user.sessions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Creates a new Supreme client account with default ledger accounts
   */
  async create(dto: CreateUserDto, adminId?: string, ipAddress?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email '${normalizedEmail}' already exists.`,
      );
    }

    const isGeneratedPassphrase = !dto.passphrase;
    const rawPassword =
      dto.passphrase || `WavySupreme!${crypto.randomBytes(16).toString("hex")}`;
    const passphraseHash = await this.cryptoService.hashPassword(rawPassword);

    const startingCash = Number(dto.startingCashBalance) || 0;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName: dto.fullName.trim(),
          passphraseHash,
          tier: dto.tier || "PRIVATE_WEALTH",
          kycTier: dto.kycTier || "TIER_1",
          isCorporate: dto.isCorporate ?? false,
          isActive: true,
        },
      });

      // 2. Initialize AVAILABLE_CASH ledger account
      const cashAccount = await tx.ledgerAccount.create({
        data: {
          userId: user.id,
          accountType: "AVAILABLE_CASH",
          currency: "USD",
          balance: startingCash,
        },
      });

      // 3. Initialize INVESTED_CAPITAL ledger account
      await tx.ledgerAccount.create({
        data: {
          userId: user.id,
          accountType: "INVESTED_CAPITAL",
          currency: "USD",
          balance: 0.0,
        },
      });

      // 4. If starting balance provided, create an initial LedgerTransaction and entry
      if (startingCash > 0) {
        const refId = `TX-INIT-${user.id.slice(0, 8)}-${Date.now()}`;
        const txRecord = await tx.ledgerTransaction.create({
          data: {
            referenceId: refId,
            type: "DEPOSIT",
            status: "SETTLED",
            description: "Initial Supreme Capital Allocation",
            amount: startingCash,
            currency: "USD",
            rail: "SWISS_SIC",
            counterparty: "Treasury Seed Allocation",
          },
        });

        await tx.ledgerEntry.create({
          data: {
            transactionId: txRecord.id,
            accountId: cashAccount.id,
            amount: startingCash,
          },
        });
      }

      // 5. Audit Logging
      await tx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: "USER_CREATE",
          targetEntity: "User",
          targetId: user.id,
          diffAfter: JSON.stringify({
            email: user.email,
            fullName: user.fullName,
            tier: user.tier,
            startingCash,
          }),
          reason: "Administrator provisioned new Supreme client dossier",
          ipAddressHash: this.cryptoService.hashIpAddress(
            ipAddress || "127.0.0.1",
          ),
        },
      });

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
        kycTier: user.kycTier,
        isCorporate: user.isCorporate,
        isActive: user.isActive,
        startingCashBalance: startingCash,
        temporaryPassphrase: isGeneratedPassphrase ? rawPassword : undefined,
        createdAt: user.createdAt,
      };
    });

    this.logger.log(
      `Created new client account '${result.id}' (${result.email}) by operator ${adminId || "SYSTEM"}`,
    );
    return result;
  }

  /**
   * Suspends a client account: sets isActive=false and purges all active JWT sessions
   */
  async suspend(id: string, adminId?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${id}' was not found.`,
      );
    }

    if (!user.isActive) {
      return {
        id: user.id,
        email: user.email,
        isActive: false,
        status: "Locked",
        revokedSessionsCount: 0,
        message: "Account is already suspended.",
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Set user inactive
      const updatedUser = await tx.user.update({
        where: { id },
        data: { isActive: false },
      });

      // 2. Kill all active sessions instantly
      const deletedSessions = await tx.session.deleteMany({
        where: { userId: id },
      });

      // 3. Record Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: "USER_SUSPEND",
          targetEntity: "User",
          targetId: id,
          diffBefore: JSON.stringify({ isActive: true }),
          diffAfter: JSON.stringify({
            isActive: false,
            revokedSessions: deletedSessions.count,
          }),
          reason:
            "Emergency or Compliance account kill-switch triggered by administrator",
          ipAddressHash: this.cryptoService.hashIpAddress(
            ipAddress || "127.0.0.1",
          ),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        status: "Locked",
        revokedSessionsCount: deletedSessions.count,
        message: "Account suspended and active sessions severed.",
      };
    });

    this.logger.warn(
      `Account '${id}' suspended by operator ${adminId || "SYSTEM"}`,
    );
    return result;
  }

  /**
   * Unsuspends a client account: restores isActive=true
   */
  async unsuspend(id: string, adminId?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${id}' was not found.`,
      );
    }

    if (user.isActive) {
      return {
        id: user.id,
        email: user.email,
        isActive: true,
        status: "Active",
        message: "Account is already active.",
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { isActive: true },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: "USER_UNSUSPEND",
          targetEntity: "User",
          targetId: id,
          diffBefore: JSON.stringify({ isActive: false }),
          diffAfter: JSON.stringify({ isActive: true }),
          reason: "Account reinstated to operational status by administrator",
          ipAddressHash: this.cryptoService.hashIpAddress(
            ipAddress || "127.0.0.1",
          ),
        },
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        status: "Active",
        message: "Account reinstated to active status.",
      };
    });

    this.logger.log(
      `Account '${id}' unsuspended by operator ${adminId || "SYSTEM"}`,
    );
    return result;
  }

  /**
   * Updates an existing Supreme client's details (fullName, email, tier, kycTier, isCorporate, isActive, passphrase)
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    adminId?: string,
    ipAddress?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { ledgerAccounts: true },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${id}' was not found.`,
      );
    }

    const dataToUpdate: any = {};

    if (
      dto.email &&
      dto.email.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const existing = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        throw new ConflictException(
          `User with email '${normalizedEmail}' already exists.`,
        );
      }
      dataToUpdate.email = normalizedEmail;
    }

    if (dto.fullName !== undefined) {
      dataToUpdate.fullName = dto.fullName.trim();
    }

    if (dto.tier !== undefined) {
      dataToUpdate.tier = dto.tier;
    }

    if (dto.kycTier !== undefined) {
      dataToUpdate.kycTier = dto.kycTier;
    }

    if (dto.isCorporate !== undefined) {
      dataToUpdate.isCorporate = dto.isCorporate;
    }

    if (dto.isActive !== undefined) {
      dataToUpdate.isActive = dto.isActive;
    }

    if (dto.passphrase && dto.passphrase.trim()) {
      dataToUpdate.passphraseHash = await this.cryptoService.hashPassword(
        dto.passphrase.trim(),
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.user.update({
        where: { id },
        data: dataToUpdate,
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: adminId || null,
          action: "USER_UPDATE",
          targetEntity: "User",
          targetId: id,
          diffBefore: JSON.stringify({
            email: user.email,
            fullName: user.fullName,
            tier: user.tier,
            kycTier: user.kycTier,
            isActive: user.isActive,
          }),
          diffAfter: JSON.stringify(dataToUpdate),
          reason: "Client dossier profile updated by administrator",
          ipAddressHash: this.cryptoService.hashIpAddress(
            ipAddress || "127.0.0.1",
          ),
        },
      });

      return res;
    });

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      tier: updated.tier,
      kycTier: updated.kycTier,
      isCorporate: updated.isCorporate,
      isActive: updated.isActive,
      status: updated.isActive ? "Active" : "Locked",
      message: `Client account '${updated.email}' updated successfully.`,
    };
  }

  /**
   * Dispatches direct administrative email notification to client via Resend
   */
  async sendEmail(
    id: string,
    dto: EmailUserDto,
    adminId?: string,
    ipAddress?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${id}' was not found.`,
      );
    }

    let emailDelivered = false;
    let resendMessageId: string | null = null;
    let deliveryError: string | null = null;

    if (this.resendClient) {
      try {
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${dto.subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f1f5f9; padding: 24px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; overflow: hidden; }
    .header { padding: 24px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-bottom: 1px solid #374151; }
    .header h1 { margin: 0; color: #fbbf24; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; }
    .body { padding: 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .footer { padding: 16px 24px; background-color: #030712; border-top: 1px solid #1f2937; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>WAVYASSETS EXECUTIVE DESK</h1>
    </div>
    <div class="body">
      <p style="font-weight: 600; color: #f8fafc;">Dear ${user.fullName || "Valued Client"},</p>
      <div>${dto.message.replace(/\n/g, "<br/>")}</div>
    </div>
    <div class="footer">
      <p>This is an administrative notification from WavyAssets Custody & Asset Management.</p>
      <p>&copy; ${new Date().getFullYear()} WavyAssets AG. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

        const response = await this.resendClient.emails.send({
          from: this.emailFrom,
          to: user.email,
          subject: dto.subject,
          html,
          text: dto.message,
        });

        if (response.error) {
          deliveryError = response.error.message;
          this.logger.error(
            `Resend API rejected dispatch to ${user.email}: ${deliveryError}`,
          );
        } else {
          emailDelivered = true;
          resendMessageId = response.data?.id || null;
          this.logger.log(
            `Resend dispatched email to ${user.email}. ID: ${resendMessageId}`,
          );
        }
      } catch (err: any) {
        deliveryError = err?.message || "Unexpected Resend exception";
        this.logger.error(
          `Failed to dispatch email via Resend to ${user.email}: ${deliveryError}`,
          err,
        );
      }
    } else {
      this.logger.warn(
        `Resend client is not active. Email simulated for ${user.email}`,
      );
    }

    // Log the email notification in admin audit trail
    await this.prisma.adminAuditLog.create({
      data: {
        adminId: adminId || null,
        action: "USER_EMAIL_DISPATCH",
        targetEntity: "User",
        targetId: id,
        diffAfter: JSON.stringify({
          recipient: user.email,
          subject: dto.subject,
          preview: dto.message.slice(0, 100),
          provider: "resend",
          delivered: emailDelivered,
          resendId: resendMessageId,
          error: deliveryError,
        }),
        reason: `Direct administrative dispatch: ${dto.subject}`,
        ipAddressHash: this.cryptoService.hashIpAddress(
          ipAddress || "127.0.0.1",
        ),
      },
    });

    if (deliveryError && !emailDelivered) {
      throw new BadRequestException(
        `Failed to send email via Resend: ${deliveryError}`,
      );
    }

    return {
      success: true,
      recipient: user.email,
      subject: dto.subject,
      message: `Email successfully dispatched to ${user.email} via Resend.`,
      resendId: resendMessageId,
      sentAt: new Date().toISOString(),
    };
  }

  /**
   * Cascading deletion of a client account that purges ALL user details and transactions in the DB
   */
  async deleteUser(
    id: string,
    confirmationKey?: string,
    adminId?: string,
    ipAddress?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        ledgerAccounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${id}' was not found.`,
      );
    }

    // If confirmationKey is supplied, verify it matches user email or ID
    if (
      confirmationKey &&
      confirmationKey.trim().toLowerCase() !== user.email.toLowerCase() &&
      confirmationKey.trim() !== user.id
    ) {
      throw new BadRequestException(
        "Confirmation key does not match client record. Deletion aborted for safety.",
      );
    }

    await this.prisma.$transaction(
      async (tx) => {
        // 1. Gather all ledger account IDs for this user
        const accountIds = user.ledgerAccounts.map((a) => a.id);
        if (accountIds.length > 0) {
          // Find all entry records
          const entries = await tx.ledgerEntry.findMany({
            where: { accountId: { in: accountIds } },
            select: { id: true, transactionId: true },
          });

          const transactionIds = [
            ...new Set(entries.map((e) => e.transactionId)),
          ];

          // Purge all ledger entries for this user's accounts
          await tx.ledgerEntry.deleteMany({
            where: { accountId: { in: accountIds } },
          });

          // Purge all ledger transactions associated with these entries
          if (transactionIds.length > 0) {
            await tx.ledgerTransaction.deleteMany({
              where: { id: { in: transactionIds } },
            });
          }
        }

        // 2. Also purge any orphaned transactions explicitly referring to this user ID or email
        await tx.ledgerTransaction
          .deleteMany({
            where: {
              OR: [
                { referenceId: { contains: id } },
                { description: { contains: id } },
                { counterparty: user.email },
                { accountNumber: user.email },
              ],
            },
          })
          .catch(() => {});

        // 3. Purge all Vertical holdings, positions, and orders
        await tx.cryptoHolding.deleteMany({ where: { userId: id } });
        await tx.dcaSchedule.deleteMany({ where: { userId: id } });
        await tx.stockOrder.deleteMany({ where: { userId: id } });
        await tx.stockPosition.deleteMany({ where: { userId: id } });
        await tx.aiFundPosition.deleteMany({ where: { userId: id } });
        await tx.realEstateShare.deleteMany({ where: { userId: id } });
        await tx.carShare.deleteMany({ where: { userId: id } });
        await tx.driveBooking.deleteMany({ where: { userId: id } });
        await tx.vipCard.deleteMany({ where: { userId: id } });

        // 4. Purge compliance documents, whitelist addresses, webAuthn keys
        await tx.kycDocument.deleteMany({ where: { userId: id } });
        await tx.whitelistDestination.deleteMany({ where: { userId: id } });
        await tx.webAuthnCredential.deleteMany({ where: { userId: id } });

        // 5. Purge sessions, OTP codes, simulation intents, and user audit logs
        await tx.session.deleteMany({ where: { userId: id } });
        await tx.otpCode.deleteMany({ where: { userId: id } });
        await tx.simulationIntent.deleteMany({ where: { userId: id } });
        await tx.auditLog.deleteMany({ where: { userId: id } });

        // 6. Purge user ledger accounts
        await tx.ledgerAccount.deleteMany({ where: { userId: id } });

        // 7. Delete the User record itself
        await tx.user.delete({
          where: { id },
        });

        // 8. Record Immutable Admin Audit Trail
        await tx.adminAuditLog.create({
          data: {
            adminId: adminId || null,
            action: "USER_DELETE",
            targetEntity: "User",
            targetId: id,
            diffBefore: JSON.stringify({
              id: user.id,
              email: user.email,
              fullName: user.fullName,
              tier: user.tier,
            }),
            reason:
              "Complete purging of client account and all related database records and transactions",
            ipAddressHash: this.cryptoService.hashIpAddress(
              ipAddress || "127.0.0.1",
            ),
          },
        });
      },
      { maxWait: 10000, timeout: 25000 },
    );

    this.logger.warn(
      `Account '${id}' (${user.email}) permanently deleted with all transactions by operator ${adminId || "SYSTEM"}`,
    );
    return {
      id,
      email: user.email,
      deleted: true,
      message: `Client account '${user.email}' and all associated database records and transactions were permanently purged.`,
    };
  }

  /**
   * Atomic direct capital funding / debit with double-entry ledger bookkeeping
   */
  async fundBalance(
    userId: string,
    dto: FundBalanceDto,
    adminId?: string,
    ipAddress?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(
        `Client account with ID '${userId}' was not found.`,
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        "Account is suspended. Direct capital funding or balance adjustment is strictly prohibited on locked accounts.",
      );
    }

    const currency = (dto.currency || "USD").toUpperCase();
    const amount = Number(dto.amount);
    const referenceId =
      dto.referenceId ||
      `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    if (amount <= 0 || isNaN(amount)) {
      throw new BadRequestException("Amount must be a positive finite number.");
    }

    const maxRetries = 3;
    let attempt = 0;
    while (true) {
      try {
        const result = await this.prisma.$transaction(
          async (tx) => {
            // 1. Idempotency Check on referenceId
            const existingTx = await tx.ledgerTransaction.findUnique({
              where: { referenceId },
            });

            if (existingTx) {
              throw new ConflictException(
                `A ledger transaction with referenceId '${referenceId}' already exists. Idempotency check failed.`,
              );
            }

            // 2. Fetch or create targeted LedgerAccount
            let account = await tx.ledgerAccount.findUnique({
              where: {
                userId_accountType_currency: {
                  userId,
                  accountType: dto.accountType,
                  currency,
                },
              },
            });

            if (!account) {
              account = await tx.ledgerAccount.create({
                data: {
                  userId,
                  accountType: dto.accountType,
                  currency,
                  balance: 0.0,
                },
              });
            }

            const currentBalance = Number(account.balance);

            // 3. For debit, enforce balance conservation (no negative balances)
            if (
              dto.direction === BalanceFundDirection.DEBIT &&
              currentBalance < amount
            ) {
              throw new BadRequestException(
                `Insufficient ${dto.accountType} balance for debit adjustment. Current balance is $${currentBalance.toLocaleString()} ${currency}, attempted debit is $${amount.toLocaleString()} ${currency}.`,
              );
            }

            const newBalance =
              dto.direction === BalanceFundDirection.CREDIT
                ? currentBalance + amount
                : currentBalance - amount;

            // 4. Update account balance
            const updatedAccount = await tx.ledgerAccount.update({
              where: { id: account.id },
              data: { balance: newBalance },
            });

            // 5. Create LedgerTransaction
            const txType =
              dto.direction === BalanceFundDirection.CREDIT
                ? "DEPOSIT"
                : "ADJUSTMENT";
            const ledgerTx = await tx.ledgerTransaction.create({
              data: {
                referenceId,
                type: txType,
                status: "SETTLED",
                description: dto.auditReason,
                amount: amount,
                currency: currency,
                rail: "SWISS_SIC",
                counterparty: "Treasury Admin Adjustment",
              },
            });

            // 6. Create LedgerEntry
            const entryAmount =
              dto.direction === BalanceFundDirection.CREDIT ? amount : -amount;
            const entry = await tx.ledgerEntry.create({
              data: {
                transactionId: ledgerTx.id,
                accountId: account.id,
                amount: entryAmount,
              },
            });

            // 7. Structured Immutable Audit Trail
            await tx.adminAuditLog.create({
              data: {
                adminId: adminId || null,
                action:
                  dto.direction === BalanceFundDirection.CREDIT
                    ? "BALANCE_CREDIT"
                    : "BALANCE_DEBIT",
                targetEntity: "LedgerAccount",
                targetId: account.id,
                diffBefore: JSON.stringify({
                  balance: currentBalance,
                  accountType: dto.accountType,
                  currency,
                }),
                diffAfter: JSON.stringify({
                  balance: newBalance,
                  accountType: dto.accountType,
                  currency,
                  delta: entryAmount,
                  referenceId,
                }),
                reason: dto.auditReason,
                ipAddressHash: this.cryptoService.hashIpAddress(
                  ipAddress || "127.0.0.1",
                ),
              },
            });

            this.logger.log(
              `Funded account ${account.id} for user ${userId}: ${dto.direction} ${amount} ${currency}. New Balance: ${newBalance}`,
            );

            return {
              transactionId: ledgerTx.id,
              referenceId: ledgerTx.referenceId,
              accountType: dto.accountType,
              currency,
              direction: dto.direction,
              amount,
              previousBalance: currentBalance,
              newBalance: Number(updatedAccount.balance),
              settledAt: ledgerTx.createdAt,
              auditReason: dto.auditReason,
            };
          },
          { maxWait: 5000, timeout: 10000 },
        );

        // Dispatch transactional email notification advice to user for balance modification
        try {
          if (user.email && this.emailService) {
            await this.emailService.sendTransactionNotification({
              toEmail: user.email,
              userFullName: user.fullName ?? undefined,
              transactionType: dto.direction === BalanceFundDirection.CREDIT ? "DEPOSIT" : "ADJUSTMENT",
              direction: dto.direction === BalanceFundDirection.CREDIT ? "CREDIT" : "DEBIT",
              amount,
              currency,
              description: dto.auditReason,
              referenceId,
              accountType: dto.accountType,
              newBalance: result.newBalance,
              timestamp: new Date(),
            });
          }
        } catch (emailErr: any) {
          this.logger.warn(`Failed to dispatch balance notification email: ${emailErr?.message}`);
        }

        return result;
      } catch (err: any) {
        attempt++;
        const isTransient =
          err?.code === "P2034" ||
          (typeof err?.message === "string" &&
            (err.message.includes("SQLITE_BUSY") ||
              err.message.includes("database is locked") ||
              err.message.includes("write conflict")));

        if (isTransient && attempt < maxRetries) {
          const backoffMs = attempt * 50;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
        throw err;
      }
    }
  }
}
