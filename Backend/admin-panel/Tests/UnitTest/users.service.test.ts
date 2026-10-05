import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from '../../src/modules/users/users.service';
import { BalanceFundDirection, LedgerAccountType } from '../../src/modules/users/dto/fund-balance.dto';
import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { UserTier, KycTier } from '../../src/modules/users/dto/create-user.dto';

describe('UsersService (Unit)', () => {
  let service: UsersService;
  let mockPrisma: any;
  let mockCryptoService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      ledgerAccount: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      ledgerTransaction: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      ledgerEntry: {
        create: vi.fn(),
        deleteMany: vi.fn(),
      },
      session: {
        deleteMany: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockCryptoService = {
      hashPassword: vi.fn().mockResolvedValue('argon2id$mockedhash'),
      hashIpAddress: vi.fn().mockReturnValue('mocked_ip_hash'),
      hashBlindIndex: vi.fn().mockReturnValue('mocked_blind_hash'),
    };

    service = new UsersService(mockPrisma, mockCryptoService);
  });

  describe('findAll', () => {
    it('should aggregate availableCash and investedCapital correctly across accounts', async () => {
      mockPrisma.user.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1) // totalActive
        .mockResolvedValueOnce(0) // totalLocked
        .mockResolvedValueOnce(0); // totalInstitutional

      mockPrisma.user.findMany.mockResolvedValueOnce([
        {
          id: 'usr-1',
          email: 'investor@alpine.ch',
          fullName: 'Alpine Investor',
          tier: 'PRIVATE_WEALTH',
          kycTier: 'TIER_2',
          isCorporate: false,
          isActive: true,
          ledgerAccounts: [
            { accountType: 'AVAILABLE_CASH', currency: 'USD', balance: 50000.0 },
            { accountType: 'INVESTED_CAPITAL', currency: 'USD', balance: 150000.0 },
          ],
          vipCards: [{ cardNumberLast4: '9921', tier: 'OBSIDIAN', isFrozen: false }],
          _count: { sessions: 2, kycDocuments: 1 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      const user = result.items[0];
      expect(user.availableCash).toBe(50000.0);
      expect(user.investedCapital).toBe(150000.0);
      expect(user.totalBalance).toBe(200000.0);
      expect(user.status).toBe('Active');
      expect(user.vipCard?.tier).toBe('OBSIDIAN');
      expect(result.summaryStats.activeEntities).toBe(1);
    });
  });

  describe('create', () => {
    it('should create user, hash passphrase, and seed ledger accounts atomically', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'usr-new-001',
        email: 'founder@zpc.ch',
        fullName: 'ZPC Founder',
        tier: 'INSTITUTIONAL',
        kycTier: 'TIER_1',
        isCorporate: true,
        isActive: true,
        createdAt: new Date(),
      });

      mockPrisma.ledgerAccount.create.mockResolvedValueOnce({ id: 'acc-cash' });
      mockPrisma.ledgerAccount.create.mockResolvedValueOnce({ id: 'acc-invested' });
      mockPrisma.ledgerTransaction.create.mockResolvedValueOnce({ id: 'tx-init-001' });
      mockPrisma.ledgerEntry.create.mockResolvedValueOnce({ id: 'entry-init-001' });

      const dto = {
        email: 'founder@zpc.ch',
        fullName: 'ZPC Founder',
        tier: UserTier.INSTITUTIONAL,
        kycTier: KycTier.TIER_1,
        isCorporate: true,
        startingCashBalance: 100000,
      };

      const result = await service.create(dto, 'admin-operator-1');

      expect(mockCryptoService.hashPassword).toHaveBeenCalled();
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.ledgerAccount.create).toHaveBeenCalledTimes(2);
      expect(result.email).toBe('founder@zpc.ch');
      expect(result.startingCashBalance).toBe(100000);
    });

    it('should reject creation if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        service.create({
          email: 'duplicate@wavyassets.ch',
          fullName: 'Duplicate User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('suspend & unsuspend', () => {
    it('suspend should set isActive=false and purge active sessions', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-suspend-1',
        email: 'target@risk.ch',
        isActive: true,
      });

      mockPrisma.user.update.mockResolvedValueOnce({
        id: 'usr-suspend-1',
        email: 'target@risk.ch',
        isActive: false,
      });

      mockPrisma.session.deleteMany.mockResolvedValueOnce({ count: 3 });

      const result = await service.suspend('usr-suspend-1', 'compliance-officer-1');

      expect(result.isActive).toBe(false);
      expect(result.status).toBe('Locked');
      expect(result.revokedSessionsCount).toBe(3);
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'usr-suspend-1' },
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('unsuspend should set isActive=true', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-unsuspend-1',
        email: 'reinstated@risk.ch',
        isActive: false,
      });

      mockPrisma.user.update.mockResolvedValueOnce({
        id: 'usr-unsuspend-1',
        email: 'reinstated@risk.ch',
        isActive: true,
      });

      const result = await service.unsuspend('usr-unsuspend-1', 'admin-1');

      expect(result.isActive).toBe(true);
      expect(result.status).toBe('Active');
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
    });
  });

  describe('fundBalance', () => {
    it('should atomically credit balance, create LedgerTransaction, and LedgerEntry', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-credit-1',
        isActive: true,
      });

      mockPrisma.ledgerTransaction.findUnique.mockResolvedValueOnce(null);

      mockPrisma.ledgerAccount.findUnique.mockResolvedValueOnce({
        id: 'acc-cash-1',
        userId: 'usr-credit-1',
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: 20000.0,
      });

      mockPrisma.ledgerAccount.update.mockResolvedValueOnce({
        id: 'acc-cash-1',
        balance: 70000.0,
      });

      mockPrisma.ledgerTransaction.create.mockResolvedValueOnce({
        id: 'tx-1',
        referenceId: 'TX-REF-772',
        createdAt: new Date(),
      });

      mockPrisma.ledgerEntry.create.mockResolvedValueOnce({ id: 'entry-1' });

      const dto = {
        accountType: LedgerAccountType.AVAILABLE_CASH,
        currency: 'USD',
        amount: 50000.0,
        direction: BalanceFundDirection.CREDIT,
        auditReason: 'Wire settlement confirmation Ref #8819',
        referenceId: 'TX-REF-772',
      };

      const result = await service.fundBalance('usr-credit-1', dto, 'treasury-officer-1');

      expect(result.direction).toBe(BalanceFundDirection.CREDIT);
      expect(result.previousBalance).toBe(20000.0);
      expect(result.newBalance).toBe(70000.0);
      expect(result.amount).toBe(50000.0);
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
    });

    it('should reject debit if balance is insufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-debit-fail',
        isActive: true,
      });

      mockPrisma.ledgerTransaction.findUnique.mockResolvedValueOnce(null);

      mockPrisma.ledgerAccount.findUnique.mockResolvedValueOnce({
        id: 'acc-cash-fail',
        userId: 'usr-debit-fail',
        accountType: 'AVAILABLE_CASH',
        currency: 'USD',
        balance: 1000.0,
      });

      const dto = {
        accountType: LedgerAccountType.AVAILABLE_CASH,
        currency: 'USD',
        amount: 5000.0,
        direction: BalanceFundDirection.DEBIT,
        auditReason: 'Attempted overdraft adjustment',
        referenceId: 'TX-REF-FAIL-1',
      };

      await expect(service.fundBalance('usr-debit-fail', dto, 'treasury-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject funding if user is suspended', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'usr-suspended',
        isActive: false, // Suspended
      });

      const dto = {
        accountType: LedgerAccountType.AVAILABLE_CASH,
        currency: 'USD',
        amount: 5000.0,
        direction: BalanceFundDirection.CREDIT,
        auditReason: 'Funding attempt on suspended account',
        referenceId: 'TX-REF-LOCKED-1',
      };

      await expect(service.fundBalance('usr-suspended', dto, 'treasury-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
