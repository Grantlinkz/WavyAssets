import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CryptoService } from '../../common/services/crypto.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminQueryDto } from './dto/admin-query.dto';
import {
  AdminRole,
  ROLE_PERMISSIONS,
} from '../../common/constants/roles.constant';

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN:
    'Full root governance across treasury, security parameters, personnel directory, and institutional compliance.',
  TREASURY_OFFICER:
    'Liquidity rebalancing, settlement verification, FINMA Art. 14 dual sign-offs, and cold vault matrix control.',
  COMPLIANCE_OFFICER:
    'KYC/AML verification, sanction screening, risk profiling, CIP inspection, and entity freezing.',
  DESK_LEAD:
    'Direct capital funding, client onboarding, OTC execution, and account oversight.',
  CONCIERGE:
    'Obsidian cardholder requests, high-touch luxury bespoke requests, and concierge ticket management.',
};

@Injectable()
export class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  private formatSafeAdmin(admin: any) {
    const roleKey = admin.role as AdminRole;
    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      permissions: ROLE_PERMISSIONS[roleKey] || [],
      roleDescription:
        ROLE_DESCRIPTIONS[admin.role] ||
        'Standard operational access with defined administrative scope.',
    };
  }

  async findAll(query: AdminQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (query.role && query.role !== 'ALL') {
      where.role = query.role;
    }

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'ACTIVE') {
        where.isActive = true;
      } else if (query.status === 'SUSPENDED') {
        where.isActive = false;
      }
    }

    const [total, admins] = await Promise.all([
      this.prisma.adminUser.count({ where }),
      this.prisma.adminUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: admins.map((a) => this.formatSafeAdmin(a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException(`Personnel with ID '${id}' not found`);
    }
    return this.formatSafeAdmin(admin);
  }

  async createAdmin(operatorId: string, dto: CreateAdminDto) {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException(
        `An administrative account with email '${dto.email}' already exists`,
      );
    }

    const passphraseHash = await this.cryptoService.hashPassword(dto.passphrase);

    const newAdmin = await this.prisma.adminUser.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        fullName: dto.fullName.trim(),
        passphraseHash,
        role: dto.role,
        isActive: true,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId: operatorId || null,
        action: 'ADMIN_CREATE',
        targetEntity: 'AdminUser',
        targetId: newAdmin.id,
        diffBefore: null,
        diffAfter: JSON.stringify({
          id: newAdmin.id,
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          role: newAdmin.role,
        }),
        reason: `Registered new administrative personnel: ${newAdmin.fullName} (${newAdmin.email}) as ${newAdmin.role}`,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(operatorId || 'system').slice(0, 16),
      },
    });

    this.logger.log(
      `Admin personnel created: ${newAdmin.id} (${newAdmin.email}) with role ${newAdmin.role} by ${operatorId}`,
    );

    return this.formatSafeAdmin(newAdmin);
  }

  async updateAdmin(operatorId: string, id: string, dto: UpdateAdminDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Personnel with ID '${id}' not found`);
    }

    if (dto.email && dto.email.toLowerCase().trim() !== admin.email) {
      const emailTaken = await this.prisma.adminUser.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (emailTaken) {
        throw new ConflictException(
          `Email '${dto.email}' is already assigned to another administrative personnel`,
        );
      }
    }

    const dataToUpdate: any = {};
    if (dto.fullName) dataToUpdate.fullName = dto.fullName.trim();
    if (dto.email) dataToUpdate.email = dto.email.toLowerCase().trim();
    if (dto.role) dataToUpdate.role = dto.role;

    if (dto.passphrase && dto.passphrase.trim()) {
      dataToUpdate.passphraseHash = await this.cryptoService.hashPassword(
        dto.passphrase.trim(),
      );
    }

    const diffBefore = {
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    };

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data: dataToUpdate,
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId: operatorId || null,
        action: 'ADMIN_UPDATE',
        targetEntity: 'AdminUser',
        targetId: updated.id,
        diffBefore: JSON.stringify(diffBefore),
        diffAfter: JSON.stringify({
          fullName: updated.fullName,
          email: updated.email,
          role: updated.role,
          passwordUpdated: !!dto.passphrase,
        }),
        reason: `Updated administrative personnel details for ${updated.fullName} (${updated.email})`,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(operatorId || 'system').slice(0, 16),
      },
    });

    return this.formatSafeAdmin(updated);
  }

  async toggleSuspension(
    operatorId: string,
    id: string,
    suspend: boolean,
    reason?: string,
  ) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Personnel with ID '${id}' not found`);
    }

    if (operatorId === id && suspend) {
      throw new BadRequestException(
        'Self-suspension of current active administrative session is prohibited under FINMA dual-control rules',
      );
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data: { isActive: !suspend },
    });

    if (suspend) {
      // Invalidate active sessions
      await this.prisma.adminSession.deleteMany({
        where: { adminId: id },
      });
    }

    await this.prisma.adminAuditLog.create({
      data: {
        adminId: operatorId || null,
        action: suspend ? 'ADMIN_SUSPEND' : 'ADMIN_UNSUSPEND',
        targetEntity: 'AdminUser',
        targetId: updated.id,
        diffBefore: JSON.stringify({ isActive: admin.isActive }),
        diffAfter: JSON.stringify({ isActive: updated.isActive }),
        reason:
          reason ||
          `${suspend ? 'Suspended' : 'Reactivated'} administrative credentials for ${updated.fullName}`,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(operatorId || 'system').slice(0, 16),
      },
    });

    return this.formatSafeAdmin(updated);
  }

  async deleteAdmin(operatorId: string, id: string, reason?: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Personnel with ID '${id}' not found`);
    }

    if (operatorId === id) {
      throw new BadRequestException(
        'Self-deletion of active administrative identity is prohibited',
      );
    }

    // Delete related sessions
    await this.prisma.adminSession.deleteMany({
      where: { adminId: id },
    });

    // Delete admin user
    await this.prisma.adminUser.delete({
      where: { id },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        adminId: operatorId || null,
        action: 'ADMIN_DELETE',
        targetEntity: 'AdminUser',
        targetId: id,
        diffBefore: JSON.stringify({
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        }),
        diffAfter: null,
        reason:
          reason ||
          `Permanently deleted administrative personnel ${admin.fullName} (${admin.email})`,
        ipAddressHash: '0x' + this.cryptoService.hashBlindIndex(operatorId || 'system').slice(0, 16),
      },
    });

    return {
      success: true,
      message: `Personnel ${admin.fullName} has been removed from administrative directory`,
    };
  }
}
