import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmergencyService } from '../../src/modules/emergency/emergency.service';
import { BadRequestException } from '@nestjs/common';

describe('EmergencyService (Unit)', () => {
  let service: EmergencyService;
  let mockPrisma: any;
  let mockCryptoService: any;
  let mockEventsGateway: any;

  beforeEach(() => {
    mockPrisma = {
      session: {
        count: vi.fn().mockResolvedValue(1429),
      },
      vipCard: {
        count: vi.fn().mockResolvedValue(38),
        updateMany: vi.fn().mockResolvedValue({ count: 38 }),
      },
      ledgerTransaction: {
        findMany: vi.fn().mockResolvedValue([
          { amount: 3200000 },
          { amount: 1500000 },
        ]),
      },
      adminAuditLog: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'audit-log-1' }),
      },
    };

    mockCryptoService = {
      hashBlindIndex: vi.fn().mockReturnValue('mocked_hash_blind'),
    };

    mockEventsGateway = {
      emitEmergencyFreeze: vi.fn(),
      emitEmergencyUnfreeze: vi.fn(),
    };

    service = new EmergencyService(
      mockPrisma,
      mockCryptoService,
      mockEventsGateway,
    );
  });

  describe('getStatus', () => {
    it('should return nominal operational metrics when platform is active (defcon 5)', async () => {
      const status = await service.getStatus();

      expect(status.isFrozen).toBe(false);
      expect(status.defconLevel).toBe(5);
      expect(status.protocol).toBe('STANDBY');
      expect(status.telemetry.activeSessionsCount).toBe(1429);
      expect(status.telemetry.activeCardsCount).toBe(38);
      expect(status.telemetry.pendingWiresCount).toBe(2);
      expect(status.telemetry.pendingWiresVolume).toBe(4700000);
      expect(status.telemetry.vaultStatus).toBe('HSM Auto-Sign Standby');
    });
  });

  describe('freeze', () => {
    it('should trigger Defcon 1 freeze, halt VIP cards, broadcast event, and write audit log', async () => {
      const dto = {
        verificationPhrase: 'CONFIRM EMERGENCY PLATFORM FREEZE',
        reason: 'Unidentified anomalous outbound withdrawal spike on node DC1',
        secondaryOfficerId: 'officer-eleanor-vance',
      };

      const result = await service.freeze('super-admin-1', dto);

      expect(result.isFrozen).toBe(true);
      expect(result.defconLevel).toBe(1);
      expect(result.protocol).toBe('HALT-ZERO-TIER1');
      expect(result.reason).toBe(dto.reason);

      // Verify active cards locked
      expect(mockPrisma.vipCard.updateMany).toHaveBeenCalledWith({
        where: { isFrozen: false },
        data: { isFrozen: true },
      });

      // Verify WebSocket broadcast
      expect(mockEventsGateway.emitEmergencyFreeze).toHaveBeenCalledWith(
        expect.objectContaining({
          isFrozen: true,
          defconLevel: 1,
          protocol: 'HALT-ZERO-TIER1',
          reason: dto.reason,
          adminId: 'super-admin-1',
        }),
      );

      // Verify Audit Log
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'PLATFORM_EMERGENCY_FREEZE',
            targetEntity: 'Platform',
            reason: dto.reason,
          }),
        }),
      );

      expect(service.isPlatformFrozen()).toBe(true);
    });

    it('should reject freeze if platform is already frozen', async () => {
      await service.freeze('admin-1', {
        verificationPhrase: 'CONFIRM EMERGENCY PLATFORM FREEZE',
        reason: 'Initial security incident justification',
      });

      await expect(
        service.freeze('admin-2', {
          verificationPhrase: 'CONFIRM EMERGENCY PLATFORM FREEZE',
          reason: 'Duplicate freeze attempt',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unfreeze', () => {
    it('should lift freeze and restore nominal operations (defcon 5)', async () => {
      // First freeze
      await service.freeze('admin-1', {
        verificationPhrase: 'CONFIRM EMERGENCY PLATFORM FREEZE',
        reason: 'Initial incident justification',
      });

      // Then unfreeze
      const unfreezeDto = {
        verificationPhrase: 'CONFIRM EMERGENCY PLATFORM UNFREEZE',
        reason: 'FINMA regulatory clearance received and threat mitigated',
        secondaryOfficerId: 'officer-2',
      };

      const result = await service.unfreeze('super-admin-1', unfreezeDto);

      expect(result.isFrozen).toBe(false);
      expect(result.defconLevel).toBe(5);
      expect(service.isPlatformFrozen()).toBe(false);

      expect(mockEventsGateway.emitEmergencyUnfreeze).toHaveBeenCalledWith(
        expect.objectContaining({
          isFrozen: false,
          defconLevel: 5,
          reason: unfreezeDto.reason,
        }),
      );

      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'PLATFORM_EMERGENCY_UNFREEZE',
            targetEntity: 'Platform',
          }),
        }),
      );
    });

    it('should reject unfreeze if platform is not currently frozen', async () => {
      await expect(
        service.unfreeze('admin-1', {
          verificationPhrase: 'CONFIRM EMERGENCY PLATFORM UNFREEZE',
          reason: 'Attempting to unfreeze an active platform',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
