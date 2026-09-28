import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditService } from '../../src/modules/audit/audit.service';
import { NotFoundException } from '@nestjs/common';

describe('AuditService (Unit)', () => {
  let service: AuditService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      adminAuditLog: {
        count: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        groupBy: vi.fn(),
      },
    };

    service = new AuditService(mockPrisma);
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs with parsed diffs and action distributions', async () => {
      mockPrisma.adminAuditLog.count.mockResolvedValueOnce(2);
      mockPrisma.adminAuditLog.findMany.mockResolvedValueOnce([
        {
          id: 'log-1',
          adminId: 'admin-1',
          action: 'VIP_CARD_MINT',
          targetEntity: 'VipCard',
          targetId: 'card-1',
          diffBefore: null,
          diffAfter: JSON.stringify({ tier: 'OBSIDIAN', limit: 50000 }),
          reason: 'Initial VIP card mint',
          ipAddressHash: '0x1234abcd',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date('2026-09-28T10:00:00Z'),
          admin: {
            id: 'admin-1',
            fullName: 'Super Operator',
            email: 'admin@wavy.ch',
            role: 'SUPER_ADMIN',
          },
        },
        {
          id: 'log-2',
          adminId: 'admin-1',
          action: 'VIP_CARD_FREEZE_TOGGLE',
          targetEntity: 'VipCard',
          targetId: 'card-1',
          diffBefore: JSON.stringify({ isFrozen: false }),
          diffAfter: JSON.stringify({ isFrozen: true }),
          reason: 'Suspected compromised terminal',
          ipAddressHash: '0x1234abcd',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date('2026-09-28T10:05:00Z'),
          admin: {
            id: 'admin-1',
            fullName: 'Super Operator',
            email: 'admin@wavy.ch',
            role: 'SUPER_ADMIN',
          },
        },
      ]);

      mockPrisma.adminAuditLog.groupBy.mockResolvedValueOnce([
        { action: 'VIP_CARD_MINT', _count: { action: 1 } },
        { action: 'VIP_CARD_FREEZE_TOGGLE', _count: { action: 1 } },
      ]);

      const result = await service.getAuditLogs({ page: 1, limit: 10 });

      expect(result.logs).toHaveLength(2);
      expect(result.logs[0].diffAfter).toEqual({ tier: 'OBSIDIAN', limit: 50000 });
      expect(result.logs[1].diffBefore).toEqual({ isFrozen: false });
      expect(result.logs[1].diffAfter).toEqual({ isFrozen: true });
      expect(result.summary.totalLogs).toBe(2);
      expect(result.summary.actionsDistribution).toEqual({
        VIP_CARD_MINT: 1,
        VIP_CARD_FREEZE_TOGGLE: 1,
      });
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('getAuditLogById', () => {
    it('should return formatted audit log for existing ID', async () => {
      mockPrisma.adminAuditLog.findUnique.mockResolvedValueOnce({
        id: 'log-1',
        action: 'PLATFORM_EMERGENCY_FREEZE',
        targetEntity: 'Platform',
        targetId: 'GLOBAL_PLATFORM',
        diffBefore: JSON.stringify({ isFrozen: false }),
        diffAfter: JSON.stringify({ isFrozen: true }),
        reason: 'Statutory FINMA containment protocol',
        ipAddressHash: '0xhash',
        userAgent: 'NestJS Test Engine',
        createdAt: new Date('2026-09-28T09:00:00Z'),
        admin: {
          id: 'adm-1',
          fullName: 'Security Lead',
          email: 'sec@wavy.ch',
          role: 'SUPER_ADMIN',
        },
      });

      const log = await service.getAuditLogById('log-1');

      expect(log.id).toBe('log-1');
      expect(log.action).toBe('PLATFORM_EMERGENCY_FREEZE');
      expect(log.diffAfter).toEqual({ isFrozen: true });
    });

    it('should throw NotFoundException if log does not exist', async () => {
      mockPrisma.adminAuditLog.findUnique.mockResolvedValueOnce(null);

      await expect(service.getAuditLogById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('generateComplianceExport', () => {
    it('should generate formatted regulatory compliance dataset', async () => {
      mockPrisma.adminAuditLog.findMany.mockResolvedValueOnce([
        {
          id: 'log-export-1',
          adminId: 'officer-1',
          action: 'BALANCE_CREDIT',
          targetEntity: 'LedgerAccount',
          targetId: 'acc-1',
          diffBefore: JSON.stringify({ balance: '1000000' }),
          diffAfter: JSON.stringify({ balance: '2500000' }),
          reason: 'Wire settlement SIC-8921',
          ipAddressHash: '0xblinded_ip',
          createdAt: new Date('2026-09-28T08:00:00Z'),
          admin: {
            id: 'officer-1',
            fullName: 'Treasury Desk',
            email: 'treasury@wavy.ch',
          },
        },
      ]);

      const exportData = await service.generateComplianceExport({
        action: 'BALANCE_CREDIT',
      });

      expect(exportData.exportMetadata.regulatorStandard).toContain('FINMA AMLA Art. 14');
      expect(exportData.exportMetadata.totalRecords).toBe(1);
      expect(exportData.records).toHaveLength(1);
      expect(exportData.records[0].operatorName).toBe('Treasury Desk');
      expect(exportData.records[0].diffAfter).toEqual({ balance: '2500000' });
    });
  });
});
