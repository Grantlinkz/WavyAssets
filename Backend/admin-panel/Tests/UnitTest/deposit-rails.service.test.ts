import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DepositRailsService } from '../../src/modules/deposit-rails/deposit-rails.service';

describe('DepositRailsService', () => {
  let service: DepositRailsService;
  let mockPrisma: any;
  let mockCryptoService: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockPrisma = {
      fiatDepositRailConfig: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
      },
      cryptoDepositRailConfig: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
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
      emitDepositRailUpdated: vi.fn(),
    };

    service = new DepositRailsService(
      mockPrisma,
      mockCryptoService,
      mockEventsGateway,
    );
  });

  describe('getAllRails', () => {
    it('should return fiat coordinates and grouped crypto rails', async () => {
      mockPrisma.fiatDepositRailConfig.findUnique.mockResolvedValue({
        id: 'GLOBAL_FIAT_RAIL',
        beneficiaryName: 'WavyAssets Custody AG',
        swissIban: 'CH93 0023 8812 4019 8821 0',
        bicSwift: 'UBSWCHZH80A',
        clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
        memoFormat: 'WY-{USER_REF}-TREASURY-03',
        updatedAt: new Date(),
        updatedBy: 'op-super_admin-01',
      });

      mockPrisma.cryptoDepositRailConfig.findMany.mockResolvedValue([
        {
          id: 'rail-1',
          asset: 'USDC',
          network: 'ERC-20',
          vaultAddress: '0x94A8D19F200c9261a81eC97669d0339dE78E916B',
          minDepositUsd: 500,
          confirmations: 3,
          isActive: true,
        },
        {
          id: 'rail-2',
          asset: 'BTC',
          network: 'Bitcoin Native',
          vaultAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
          minDepositUsd: 1000,
          confirmations: 2,
          isActive: true,
        },
      ]);

      const result = await service.getAllRails();

      expect(result.fiat).toBeDefined();
      expect(result.fiat?.beneficiaryName).toBe('WavyAssets Custody AG');
      expect(result.crypto).toHaveLength(2);
      expect(result.groupedCrypto['USDC']).toBeDefined();
      expect(result.metadata.totalCryptoRails).toBe(2);
      expect(result.metadata.activeCryptoRailsCount).toBe(2);
    });
  });

  describe('updateFiatRail', () => {
    it('should update fiat rail parameters, log audit entry and emit event', async () => {
      const dto = {
        beneficiaryName: 'WavyAssets Updated AG',
        swissIban: 'CH93 0023 8812 4019 8821 0',
        bicSwift: 'UBSWCHZHXXX',
        clearingRail: 'Swiss SIC / Fedwire DvP',
        memoFormat: 'WY-VAULT-{USER_REF}',
      };

      mockPrisma.fiatDepositRailConfig.findUnique.mockResolvedValue({
        id: 'GLOBAL_FIAT_RAIL',
        beneficiaryName: 'WavyAssets Custody AG',
      });

      mockPrisma.fiatDepositRailConfig.upsert.mockResolvedValue({
        id: 'GLOBAL_FIAT_RAIL',
        ...dto,
        updatedBy: 'op-treasury-01',
      });

      const result = await service.updateFiatRail(dto, 'op-treasury-01');

      expect(result.beneficiaryName).toBe('WavyAssets Updated AG');
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
      expect(mockEventsGateway.emitDepositRailUpdated).toHaveBeenCalledWith({
        railType: 'FIAT',
        fiat: expect.any(Object),
      });
    });
  });

  describe('upsertCryptoRail', () => {
    it('should upsert crypto rail configuration, log audit entry and broadcast event', async () => {
      const dto = {
        asset: 'USDC',
        network: 'Polygon',
        vaultAddress: '0x1234567890abcdef1234567890abcdef12345678',
        minDepositUsd: 100,
        confirmations: 12,
        isActive: true,
      };

      mockPrisma.cryptoDepositRailConfig.findUnique.mockResolvedValue(null);
      const railResult = {
        id: 'rail-poly-1',
        asset: 'USDC',
        network: 'Polygon',
        vaultAddress: dto.vaultAddress,
        minDepositUsd: 100,
        confirmations: 12,
        isActive: true,
      };
      mockPrisma.cryptoDepositRailConfig.upsert.mockResolvedValue(railResult);
      mockPrisma.cryptoDepositRailConfig.create.mockResolvedValue(railResult);

      const result = await service.upsertCryptoRail(dto, 'op-super_admin-01');

      expect(result.asset).toBe('USDC');
      expect(result.network).toBe('Polygon');
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
      expect(mockEventsGateway.emitDepositRailUpdated).toHaveBeenCalledWith({
        railType: 'CRYPTO',
        asset: 'USDC',
        network: 'Polygon',
        rail: expect.any(Object),
      });
    });

    it('should replace an existing rail when updating asset or network', async () => {
      const dto = {
        id: 'rail-existing-1',
        asset: 'USDC',
        network: 'Arbitrum',
        vaultAddress: '0x9999999999999999999999999999999999999999',
        minDepositUsd: 200,
        confirmations: 5,
        isActive: true,
      };

      mockPrisma.cryptoDepositRailConfig.findUnique.mockResolvedValue({
        id: 'rail-existing-1',
        asset: 'USDC',
        network: 'ERC-20',
      });
      mockPrisma.cryptoDepositRailConfig.findMany.mockResolvedValue([
        {
          id: 'rail-existing-arb',
          asset: 'USDC',
          network: 'Arbitrum',
        },
      ]);
      mockPrisma.cryptoDepositRailConfig.delete.mockResolvedValue({});
      mockPrisma.cryptoDepositRailConfig.deleteMany.mockResolvedValue({ count: 1 });

      const newRail = { ...dto, id: 'rail-new-1' };
      mockPrisma.cryptoDepositRailConfig.create.mockResolvedValue(newRail);

      const result = await service.upsertCryptoRail(dto, 'op-super_admin-01');

      expect(mockPrisma.cryptoDepositRailConfig.delete).toHaveBeenCalledWith({
        where: { id: 'rail-existing-1' },
      });
      expect(mockPrisma.cryptoDepositRailConfig.deleteMany).toHaveBeenCalled();
      expect(result.network).toBe('Arbitrum');
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
    });
  });

  describe('deleteCryptoRail', () => {
    it('should delete existing rail, log audit and emit event', async () => {
      mockPrisma.cryptoDepositRailConfig.findUnique.mockResolvedValue({
        id: 'rail-1',
        asset: 'USDC',
        network: 'ERC-20',
      });
      mockPrisma.cryptoDepositRailConfig.delete.mockResolvedValue({});

      const result = await service.deleteCryptoRail('rail-1', 'admin-1', '127.0.0.1');

      expect(result.success).toBe(true);
      expect(mockPrisma.cryptoDepositRailConfig.delete).toHaveBeenCalledWith({
        where: { id: 'rail-1' },
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalled();
      expect(mockEventsGateway.emitDepositRailUpdated).toHaveBeenCalledWith({
        railType: 'CRYPTO',
        asset: 'USDC',
        network: 'ERC-20',
        rail: null,
      });
    });

    it('should throw NotFoundException if rail does not exist', async () => {
      mockPrisma.cryptoDepositRailConfig.findUnique.mockResolvedValue(null);

      await expect(service.deleteCryptoRail('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPublicRails', () => {
    it('should return active rails for client deposit modal ingestion', async () => {
      mockPrisma.fiatDepositRailConfig.findUnique.mockResolvedValue({
        id: 'GLOBAL_FIAT_RAIL',
        beneficiaryName: 'WavyAssets Supreme Custody AG',
        swissIban: 'CH93 0023 8812 4019 8821 0',
        bicSwift: 'UBSWCHZH80A',
        clearingRail: 'Swiss SIC RTGS / Fedwire DvP',
        memoFormat: 'WY-{USER_REF}-TREASURY-03',
      });

      mockPrisma.cryptoDepositRailConfig.findMany.mockResolvedValue([
        {
          id: 'rail-1',
          asset: 'USDC',
          network: 'ERC-20',
          vaultAddress: '0x94A8D19F200c9261a81eC97669d0339dE78E916B',
          minDepositUsd: 500,
          confirmations: 3,
        },
      ]);

      const result = await service.getPublicRails();

      expect(result.fiat).toBeDefined();
      expect(result.fiat?.beneficiaryName).toBe('WavyAssets Supreme Custody AG');
      expect(result.crypto).toHaveLength(1);
      expect(result.crypto[0].asset).toBe('USDC');
    });
  });
});
