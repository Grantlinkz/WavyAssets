import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DepositRailsService } from './deposit-rails.service';
import { UpdateFiatRailDto } from './dto/update-fiat-rail.dto';
import { UpdateCryptoRailDto } from './dto/update-crypto-rail.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import { CurrentAdmin, CurrentAdminPayload } from '../../common/decorators/current-admin.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller(['admin/deposit-rails', 'deposit-rails'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class DepositRailsController {
  constructor(private readonly depositRailsService: DepositRailsService) {}

  @Get()
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.DESK_LEAD,
    AdminRole.CONCIERGE,
  )
  async getAllRails() {
    return this.depositRailsService.getAllRails();
  }

  @Put('fiat')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER)
  async updateFiatRail(
    @Body() dto: UpdateFiatRailDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.depositRailsService.updateFiatRail(dto, adminId);
  }

  @Put('crypto')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER)
  async upsertCryptoRail(
    @Body() dto: UpdateCryptoRailDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.depositRailsService.upsertCryptoRail(dto, adminId);
  }
}

@Controller(['public/deposit-rails', 'admin/deposit-rails/public'])
export class PublicDepositRailsController {
  constructor(private readonly depositRailsService: DepositRailsService) {}

  @Get()
  @Public()
  async getPublicRails() {
    return this.depositRailsService.getPublicRails();
  }
}