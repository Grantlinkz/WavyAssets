import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WalletService } from '../../../src/modules/wallet/wallet.service';
import { PrismaService } from '../../../src/prisma/prisma.service';
import {
  LedgerImbalanceException,
  QuarantineTimeLockException,
  InsufficientAvailableBalanceException,
} from '../../../src/common/exceptions';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WalletService — Double-Entry Ledger & Financial Invariants', () => {
  let walletService: WalletService;
  let mockPrisma: {
    user: { findUnique: ReturnType<typeof vi.fn> };
    ledgerAccount: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    ledgerTransaction: { create: ReturnType<typeof vi.fn> };
    ledgerEntry: { create: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
    whitelistDestination: { findUnique: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const testUserId = 'usr-institutional-001';

  beforeEach(() => {
    mockPrisma = {
      user: { findUnique: vi.fn() },
      ledgerAccount: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'acc-created', ...args.data })),
        update: vi.fn().mockImplementation((args) => Promise.resolve({ id: args?.where?.id, ...args?.data })),
      },
      ledgerTransaction: {
        create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'tx-created', referenceId: args?.data?.referenceId, ...args?.data })),
      },
      ledgerEntry: {
        create: vi.fn().mockImplementation((args) => Promise.resolve({ id: 'entry-created', ...args?.data })),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      whitelistDestination: { findUnique: vi.fn() },
      $transaction: vi.fn((cb) => cb(mockPrisma)),
    };

    walletService = new WalletService(mockPrisma as unknown as PrismaService);
  });

  describe('recordLedgerTransaction & Zero-Sum Conservation', () => {
    it('successfully executes a balanced double-entry transaction (sum = 0)', async () => {
      const mockTx = {
        id: 'tx-001',
        referenceId: 'ref-deposit-100',
        type: 'DEPOSIT',
        status: 'SETTLED',
        description: 'Deposit 100 USD',
      };
      mockPrisma.ledgerTransaction.create.mockResolvedValue(mockTx);
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-clearing',
        accountType: 'FEE_RECEIVABLE',
        balance: '500.00',
      });
      mockPrisma.ledgerEntry.create.mockResolvedValue({ id: 'ent-1' });
      mockPrisma.ledgerAccount.update.mockResolvedValue({ id: 'acc-1' });

      const result = await walletService.recordLedgerTransaction({
        referenceId: 'ref-deposit-100',
        type: 'DEPOSIT',
        description: 'Deposit 100 USD',
        entries: [
          { accountId: 'acc-user-cash', amount: 100.0 },
          { accountId: 'acc-clearing', amount: -100.0 },
        ],
      });

      expect(result.id).toBe('tx-001');
      expect(mockPrisma.ledgerTransaction.create).toHaveBeenCalled();
      expect(mockPrisma.ledgerEntry.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.ledgerAccount.update).toHaveBeenCalledTimes(2);
    });

    it('rejects an unbalanced transaction with LedgerImbalanceException (sum != 0)', async () => {
      await expect(
        walletService.recordLedgerTransaction({
          referenceId: 'ref-imbalanced',
          type: 'TRADE',
          description: 'Unbalanced trade entry',
          entries: [
            { accountId: 'acc-1', amount: 100.0 },
            { accountId: 'acc-2', amount: -95.0 }, // +5 imbalance
          ],
        }),
      ).rejects.toThrow(LedgerImbalanceException);

      expect(mockPrisma.ledgerTransaction.create).not.toHaveBeenCalled();
    });

    it('rejects a debit that would cause AVAILABLE_CASH balance to become negative', async () => {
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-user-cash',
        accountType: 'AVAILABLE_CASH',
        balance: '50.00', // Current balance is 50
      });

      await expect(
        walletService.recordLedgerTransaction({
          referenceId: 'ref-overdraft',
          type: 'WITHDRAWAL',
          description: 'Attempted overdraft',
          entries: [
            { accountId: 'acc-user-cash', amount: -100.0 }, // Would result in -50
            { accountId: 'acc-clearing', amount: 100.0 },
          ],
        }),
      ).rejects.toThrow(InsufficientAvailableBalanceException);
    });
  });

  describe('initiateFiatRamp & 48-Hour Quarantine Enforcement', () => {
    it('executes deposit, creating balanced ledger credit to AVAILABLE_CASH', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-cash', accountType: 'AVAILABLE_CASH', balance: '0' })
        .mockResolvedValueOnce({ id: 'acc-clearing', accountType: 'FEE_RECEIVABLE', balance: '0' });

      mockPrisma.ledgerTransaction.create.mockResolvedValue({
        id: 'tx-dep',
        referenceId: 'tx-dep-ref',
      });

      const res = await walletService.initiateFiatRamp(testUserId, {
        amount: 50000,
        currency: 'USD',
        direction: 'DEPOSIT',
      });

      expect(res.status).toBe('SETTLED');
      expect(res.amount).toBe(50000);
      expect(res.direction).toBe('DEPOSIT');
    });

    it('rejects withdrawal to quarantined destination with QuarantineTimeLockException (HTTP 403)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      const futureUnlock = new Date(Date.now() + 48 * 3600 * 1000);

      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-quarantined',
        userId: testUserId,
        status: 'QUARANTINE',
        quarantineUntil: futureUnlock,
        addressOrIban: 'CH9300000000000000000',
        destinationLabel: 'Swiss Private Bank',
      });

      await expect(
        walletService.initiateFiatRamp(testUserId, {
          amount: 10000,
          currency: 'USD',
          direction: 'WITHDRAWAL',
          destinationId: 'dest-quarantined',
        }),
      ).rejects.toThrow(QuarantineTimeLockException);
    });

    it('rejects withdrawal if multi-sig hardware signatures are incomplete', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-sig-incomplete',
        userId: testUserId,
        status: 'ACTIVE',
        quarantineUntil: new Date(Date.now() - 1000),
        signersRequired: 2,
        signersCompleted: 1,
        addressOrIban: 'CH9300000000000000000',
        destinationLabel: 'Swiss Private Bank',
      });

      await expect(
        walletService.initiateFiatRamp(testUserId, {
          amount: 10000,
          currency: 'USD',
          direction: 'WITHDRAWAL',
          destinationId: 'dest-sig-incomplete',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects withdrawal if destination is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: testUserId });
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue(null);

      await expect(
        walletService.initiateFiatRamp(testUserId, {
          amount: 10000,
          currency: 'USD',
          direction: 'WITHDRAWAL',
          destinationId: 'dest-unknown',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('sweepIdleCash', () => {
    it('sweeps idle cash into invested capital when balance exceeds threshold', async () => {
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-cash', accountType: 'AVAILABLE_CASH', balance: '80000' })
        .mockResolvedValueOnce({ id: 'acc-invested', accountType: 'INVESTED_CAPITAL', balance: '0' });

      mockPrisma.ledgerTransaction.create.mockResolvedValue({
        id: 'tx-sweep',
        referenceId: 'ref-sweep-1',
      });

      const res = await walletService.sweepIdleCash(testUserId, {
        threshold: 50000,
        sweepAmount: 30000,
        currency: 'USD',
      });

      expect(res.swept).toBe(true);
      expect(res.amountSwept).toBe(30000);
      expect(res.newAvailableBalance).toBe(50000);
    });

    it('skips sweep when balance does not exceed threshold', async () => {
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-cash', accountType: 'AVAILABLE_CASH', balance: '25000' })
        .mockResolvedValueOnce({ id: 'acc-invested', accountType: 'INVESTED_CAPITAL', balance: '0' });

      const res = await walletService.sweepIdleCash(testUserId, {
        threshold: 50000,
        sweepAmount: 10000,
        currency: 'USD',
      });

      expect(res.swept).toBe(false);
      expect(res.currentBalance).toBe(25000);
    });
  });

  describe('convertFx', () => {
    it('executes spot conversion with balanced entries between currency accounts', async () => {
      mockPrisma.ledgerAccount.findUnique
        .mockResolvedValueOnce({ id: 'acc-usd', accountType: 'AVAILABLE_CASH', currency: 'USD', balance: '10000' })
        .mockResolvedValueOnce({ id: 'acc-eur', accountType: 'AVAILABLE_CASH', currency: 'EUR', balance: '0' });

      mockPrisma.ledgerTransaction.create.mockResolvedValue({
        id: 'tx-fx',
        referenceId: 'ref-fx-1',
      });

      const res = await walletService.convertFx(testUserId, {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        amount: 1000,
      });

      expect(res.success).toBe(true);
      expect(res.fromCurrency).toBe('USD');
      expect(res.toCurrency).toBe('EUR');
      expect(res.amountSold).toBe(1000);
      expect(res.amountBought).toBeGreaterThan(0);
    });
  });

  describe('initiateFiatRamp KYC Tier Daily Withdrawal Limits', () => {
    it('rejects withdrawal exceeding Tier 1 daily limit ($10,000) with descriptive error', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_1',
      });

      await expect(
        walletService.initiateFiatRamp(testUserId, {
          direction: 'WITHDRAWAL',
          amount: 25000,
          currency: 'USD',
        })
      ).rejects.toThrow(
        'You have gone beyond your Tier daily limit ($10,000.00 USD for Level 1). Please upgrade your Tier.'
      );
    });

    it('allows withdrawal within Tier 1 daily limit ($10,000)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_1',
      });
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-01',
        userId: testUserId,
        status: 'ACTIVE',
        signersCompleted: 2,
        signersRequired: 2,
        destinationLabel: 'JPM Chase NYC',
        quarantineUntil: new Date(Date.now() - 100000),
      });
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-cash',
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: '50000',
      });

      const res = await walletService.initiateFiatRamp(testUserId, {
        direction: 'WITHDRAWAL',
        amount: 8000,
        currency: 'USD',
        destinationId: 'dest-01',
      });

      expect(res.status).toBe('SETTLED');
      expect(res.amount).toBe(8000);
      expect(res.direction).toBe('WITHDRAWAL');
    });

    it('allows large withdrawals for Tier 3 (unlimited limit)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUserId,
        kycTier: 'TIER_3',
      });
      mockPrisma.whitelistDestination.findUnique.mockResolvedValue({
        id: 'dest-01',
        userId: testUserId,
        status: 'ACTIVE',
        signersCompleted: 2,
        signersRequired: 2,
        destinationLabel: 'JPM Chase NYC',
        quarantineUntil: new Date(Date.now() - 100000),
      });
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-cash',
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: '20000000',
      });

      const res = await walletService.initiateFiatRamp(testUserId, {
        direction: 'WITHDRAWAL',
        amount: 1500000,
        currency: 'USD',
        destinationId: 'dest-01',
      });

      expect(res.status).toBe('SETTLED');
      expect(res.amount).toBe(1500000);
    });
  });
});

