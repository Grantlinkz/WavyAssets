import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TreasuryService } from '../../src/modules/treasury/treasury.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { SignOffAction } from '../../src/modules/treasury/dto/sign-off-withdrawal.dto';

describe('TreasuryService', () => {
  let service: TreasuryService;
  let mockPrisma: any;
  let mockCryptoService: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockPrisma = {
      ledgerTransaction: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      ledgerAccount: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      ledgerEntry: {
        create: vi.fn(),
      },
      treasurySignOff: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockCryptoService = {
      hashIpAddress: vi.fn().mockReturnValue('mock-hashed-ip'),
    };

    mockEventsGateway = {
      emitSettlementUpdate: vi.fn(),
    };

    service = new TreasuryService(
      mockPrisma,
      mockCryptoService,
      mockEventsGateway,
    );
  });

  describe('getPendingDeposits', () => {
    it('should query pending deposits with pagination and metadata', async () => {
      mockPrisma.ledgerTransaction.count.mockResolvedValue(1);
      mockPrisma.ledgerTransaction.findMany.mockResolvedValue([
        {
          id: 'tx-dep-1',
          referenceId: 'DEP-REF-01',
          amount: 50000,
          currency: 'USD',
          rail: 'SWISS_SIC',
          counterparty: 'Geneva Private Bank',
          accountNumber: 'CH93 0023 8812 4019 8821 0',
          description: 'Institutional Wire Deposit',
          status: 'PENDING',
          createdAt: new Date(),
          entries: [],
        },
      ]);

      const res = await service.getPendingDeposits({ page: 1, limit: 10 });

      expect(res.items).toHaveLength(1);
      expect(res.items[0].referenceId).toBe('DEP-REF-01');
      expect(res.summary.totalPendingCount).toBe(1);
      expect(res.summary.totalPendingAmountUsd).toBe(50000);
    });
  });

  describe('approveDeposit', () => {
    it('should throw NotFoundException if transaction does not exist', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.approveDeposit('invalid-id', 'op-admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if deposit is already SETTLED', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-dep-settled',
        type: 'DEPOSIT',
        status: 'SETTLED',
        entries: [],
      });

      await expect(
        service.approveDeposit('tx-dep-settled', 'op-admin-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should approve deposit, credit AVAILABLE_CASH balance and emit real-time event', async () => {
      const mockTx = {
        id: 'tx-dep-1',
        referenceId: 'REF-DEP-001',
        type: 'DEPOSIT',
        status: 'PENDING',
        amount: 100000,
        currency: 'USD',
        entries: [
          {
            account: {
              id: 'acc-user-1',
              userId: 'usr-client-1',
              accountType: 'AVAILABLE_CASH',
              currency: 'USD',
              balance: 50000,
            },
          },
        ],
      };

      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue(mockTx);
      mockPrisma.ledgerAccount.findUnique.mockResolvedValue({
        id: 'acc-user-1',
        userId: 'usr-client-1',
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: 50000,
      });
      mockPrisma.ledgerAccount.update.mockResolvedValue({
        id: 'acc-user-1',
        balance: 150000,
      });
      mockPrisma.ledgerTransaction.update.mockResolvedValue({
        id: 'tx-dep-1',
        referenceId: 'REF-DEP-001',
        status: 'SETTLED',
      });

      const res = await service.approveDeposit('tx-dep-1', 'op-treasury-01', {
        notes: 'Inbound wire matched',
      });

      expect(res.status).toBe('SETTLED');
      expect(res.amount).toBe(100000);
      expect(res.previousBalance).toBe(50000);
      expect(res.newBalance).toBe(150000);
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
      expect(mockEventsGateway.emitSettlementUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          txId: 'tx-dep-1',
          type: 'DEPOSIT_APPROVED',
          status: 'SETTLED',
        }),
      );
    });
  });

  describe('rejectDeposit', () => {
    it('should mark deposit as FAILED and record mandatory operator reason', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-dep-rej',
        status: 'PENDING',
      });
      mockPrisma.ledgerTransaction.update.mockResolvedValue({
        id: 'tx-dep-rej',
        referenceId: 'REF-REJ',
        status: 'FAILED',
      });

      const res = await service.rejectDeposit('tx-dep-rej', 'op-compliance-01', {
        reason: 'Unverified source of funds',
      });

      expect(res.status).toBe('FAILED');
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
      expect(mockEventsGateway.emitSettlementUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          txId: 'tx-dep-rej',
          status: 'FAILED',
        }),
      );
    });
  });

  describe('signOffWithdrawal (FINMA AMLA Article 14)', () => {
    it('should settle small withdrawal (<= $100k) with single officer sign-off', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-wd-small',
        referenceId: 'WD-SMALL',
        type: 'WITHDRAWAL',
        status: 'PENDING',
        amount: 75000,
        currency: 'USD',
      });
      mockPrisma.treasurySignOff.findMany.mockResolvedValue([]);
      mockPrisma.treasurySignOff.create.mockResolvedValue({
        id: 'so-1',
        withdrawalId: 'tx-wd-small',
        officerId: 'op-treasury-1',
        signedAt: new Date(),
        notes: 'Small wire approved',
      });
      mockPrisma.ledgerTransaction.update.mockResolvedValue({
        id: 'tx-wd-small',
        referenceId: 'WD-SMALL',
        status: 'SETTLED',
        currency: 'USD',
      });

      const res = await service.signOffWithdrawal('tx-wd-small', 'op-treasury-1', {
        action: SignOffAction.APPROVE,
        notes: 'Small wire approved',
      });

      expect(res.requiresDualSignOff).toBe(false);
      expect(res.isFullySettled).toBe(true);
      expect(res.status).toBe('SETTLED');
    });

    it('should transition institutional withdrawal (> $100k) to PENDING_SECOND_SIGN_OFF on 1st sign-off', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-wd-large',
        referenceId: 'WD-LARGE',
        type: 'WITHDRAWAL',
        status: 'PENDING',
        amount: 500000,
        currency: 'USD',
      });
      mockPrisma.treasurySignOff.findMany.mockResolvedValue([]);
      mockPrisma.treasurySignOff.create.mockResolvedValue({
        id: 'so-first',
        withdrawalId: 'tx-wd-large',
        officerId: 'op-officer-1',
        signedAt: new Date(),
      });
      mockPrisma.ledgerTransaction.update.mockResolvedValue({
        id: 'tx-wd-large',
        referenceId: 'WD-LARGE',
        status: 'PENDING_SECOND_SIGN_OFF',
        currency: 'USD',
      });

      const res = await service.signOffWithdrawal('tx-wd-large', 'op-officer-1', {
        action: SignOffAction.APPROVE,
      });

      expect(res.requiresDualSignOff).toBe(true);
      expect(res.isFullySettled).toBe(false);
      expect(res.status).toBe('PENDING_SECOND_SIGN_OFF');
      expect(res.signOffCount).toBe(1);
    });

    it('should prevent duplicate sign-off by the same officer', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-wd-large',
        type: 'WITHDRAWAL',
        status: 'PENDING_SECOND_SIGN_OFF',
        amount: 500000,
      });
      mockPrisma.treasurySignOff.findMany.mockResolvedValue([
        {
          id: 'so-first',
          withdrawalId: 'tx-wd-large',
          officerId: 'op-officer-1',
        },
      ]);

      await expect(
        service.signOffWithdrawal('tx-wd-large', 'op-officer-1', {
          action: SignOffAction.APPROVE,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should settle institutional withdrawal (> $100k) when second distinct officer signs off', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-wd-large',
        referenceId: 'WD-LARGE',
        type: 'WITHDRAWAL',
        status: 'PENDING_SECOND_SIGN_OFF',
        amount: 500000,
        currency: 'USD',
      });
      mockPrisma.treasurySignOff.findMany.mockResolvedValue([
        {
          id: 'so-first',
          withdrawalId: 'tx-wd-large',
          officerId: 'op-officer-1',
        },
      ]);
      mockPrisma.treasurySignOff.create.mockResolvedValue({
        id: 'so-second',
        withdrawalId: 'tx-wd-large',
        officerId: 'op-officer-2',
        signedAt: new Date(),
      });
      mockPrisma.ledgerTransaction.update.mockResolvedValue({
        id: 'tx-wd-large',
        referenceId: 'WD-LARGE',
        status: 'SETTLED',
        currency: 'USD',
      });

      const res = await service.signOffWithdrawal('tx-wd-large', 'op-officer-2', {
        action: SignOffAction.APPROVE,
      });

      expect(res.requiresDualSignOff).toBe(true);
      expect(res.isFullySettled).toBe(true);
      expect(res.status).toBe('SETTLED');
      expect(res.signOffCount).toBe(2);
    });
  });

  describe('rejectAndRefundWithdrawal', () => {
    it('should reject withdrawal and refund capital to AVAILABLE_CASH ledger account', async () => {
      mockPrisma.ledgerTransaction.findUnique.mockResolvedValue({
        id: 'tx-wd-refund',
        referenceId: 'REF-WD-REFUND',
        status: 'PENDING',
        amount: 150000,
        currency: 'USD',
        entries: [
          {
            account: {
              id: 'acc-user-1',
              balance: 200000,
            },
          },
        ],
      });
      mockPrisma.ledgerTransaction.update.mockResolvedValue({
        id: 'tx-wd-refund',
        referenceId: 'REF-WD-REFUND',
        status: 'FAILED',
      });
      mockPrisma.ledgerAccount.update.mockResolvedValue({
        id: 'acc-user-1',
        balance: 350000,
      });

      const res = await service.rejectAndRefundWithdrawal(
        'tx-wd-refund',
        'op-compliance-1',
        { reason: 'Beneficiary IBAN mismatch' },
      );

      expect(res.status).toBe('FAILED');
      expect(res.refunded).toBe(true);
      expect(res.refundedAmount).toBe(150000);
      expect(res.newBalance).toBe(350000);
      expect(mockPrisma.ledgerEntry.create).toHaveBeenCalled();
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
      expect(mockEventsGateway.emitSettlementUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          txId: 'tx-wd-refund',
          type: 'WITHDRAWAL_REJECTED_REFUNDED',
          status: 'FAILED',
        }),
      );
    });
  });
});
