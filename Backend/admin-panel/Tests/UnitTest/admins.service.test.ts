import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminsService } from '../../src/modules/admins/admins.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AdminRole } from '../../src/common/constants/roles.constant';

describe('AdminsService (Unit)', () => {
  let service: AdminsService;
  let mockPrisma: any;
  let mockCryptoService: any;

  beforeEach(() => {
    mockPrisma = {
      adminUser: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      adminSession: {
        deleteMany: vi.fn(),
      },
      adminAuditLog: {
        create: vi.fn(),
      },
    };

    mockCryptoService = {
      hashPassword: vi.fn().mockResolvedValue('argon2id$hashed_passphrase'),
      hashBlindIndex: vi.fn().mockReturnValue('blind_index_1234567890'),
    };

    service = new AdminsService(mockPrisma, mockCryptoService);
  });

  describe('findAll', () => {
    it('should return paginated list of admins with permissions and role descriptions', async () => {
      mockPrisma.adminUser.count.mockResolvedValue(1);
      mockPrisma.adminUser.findMany.mockResolvedValue([
        {
          id: 'admin-1',
          fullName: 'Alexander Wright',
          email: 'alexander@wavyassets.ch',
          role: AdminRole.SUPER_ADMIN,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0].fullName).toBe('Alexander Wright');
      expect(result.items[0].role).toBe(AdminRole.SUPER_ADMIN);
      expect(result.items[0].permissions).toContain('canFreezePlatform');
      expect(result.items[0].roleDescription).toContain('Full root governance');
    });
  });

  describe('createAdmin', () => {
    it('should throw ConflictException if admin email already exists', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.createAdmin('operator-super', {
          fullName: 'New Admin',
          email: 'existing@wavyassets.ch',
          passphrase: 'StrongPassword123!',
          role: AdminRole.DESK_LEAD,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should hash passphrase with Argon2id and create admin user with audit entry', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue(null);
      mockPrisma.adminUser.create.mockResolvedValue({
        id: 'new-admin-id',
        fullName: 'Marc Widmer',
        email: 'marc@wavyassets.ch',
        role: AdminRole.TREASURY_OFFICER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createAdmin('operator-super', {
        fullName: 'Marc Widmer',
        email: 'marc@wavyassets.ch',
        passphrase: 'StrongPassword123!',
        role: AdminRole.TREASURY_OFFICER,
      });

      expect(mockCryptoService.hashPassword).toHaveBeenCalledWith('StrongPassword123!');
      expect(mockPrisma.adminUser.create).toHaveBeenCalled();
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'ADMIN_CREATE',
            targetEntity: 'AdminUser',
          }),
        }),
      );
      expect(result.fullName).toBe('Marc Widmer');
      expect(result.role).toBe(AdminRole.TREASURY_OFFICER);
    });
  });

  describe('toggleSuspension', () => {
    it('should prevent self-suspension under FINMA dual-control rules', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'operator-1',
        isActive: true,
      });

      await expect(
        service.toggleSuspension('operator-1', 'operator-1', true),
      ).rejects.toThrow(BadRequestException);
    });

    it('should suspend personnel, revoke sessions, and record audit log', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'target-admin',
        fullName: 'Desk Officer',
        isActive: true,
      });
      mockPrisma.adminUser.update.mockResolvedValue({
        id: 'target-admin',
        fullName: 'Desk Officer',
        role: AdminRole.DESK_LEAD,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.toggleSuspension(
        'operator-super',
        'target-admin',
        true,
        'Suspended due to credential rotation',
      );

      expect(mockPrisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { adminId: 'target-admin' },
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'ADMIN_SUSPEND',
          }),
        }),
      );
      expect(result.isActive).toBe(false);
    });
  });

  describe('deleteAdmin', () => {
    it('should prevent self-deletion', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'operator-1',
      });

      await expect(
        service.deleteAdmin('operator-1', 'operator-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete admin and associated sessions with audit record', async () => {
      mockPrisma.adminUser.findUnique.mockResolvedValue({
        id: 'target-admin',
        fullName: 'Terminated Officer',
        email: 'terminated@wavyassets.ch',
        role: AdminRole.CONCIERGE,
      });

      const result = await service.deleteAdmin(
        'operator-super',
        'target-admin',
        'Contract expired',
      );

      expect(mockPrisma.adminSession.deleteMany).toHaveBeenCalledWith({
        where: { adminId: 'target-admin' },
      });
      expect(mockPrisma.adminUser.delete).toHaveBeenCalledWith({
        where: { id: 'target-admin' },
      });
      expect(mockPrisma.adminAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'ADMIN_DELETE',
          }),
        }),
      );
      expect(result.success).toBe(true);
    });
  });
});
