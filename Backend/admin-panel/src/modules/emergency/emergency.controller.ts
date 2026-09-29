import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { FreezePlatformDto } from './dto/freeze-platform.dto';
import { UnfreezePlatformDto } from './dto/unfreeze-platform.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import {
  CurrentAdmin,
  CurrentAdminPayload,
} from '../../common/decorators/current-admin.decorator';

@Controller(['admin/emergency', 'emergency'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('status')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
  )
  async getStatus() {
    return this.emergencyService.getStatus();
  }

  @Post('freeze')
  @Roles(AdminRole.SUPER_ADMIN)
  async freeze(
    @Body() dto: FreezePlatformDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.emergencyService.freeze(
      admin?.sub || 'system-super-admin',
      dto,
    );
  }

  @Post('unfreeze')
  @Roles(AdminRole.SUPER_ADMIN)
  async unfreeze(
    @Body() dto: UnfreezePlatformDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.emergencyService.unfreeze(
      admin?.sub || 'system-super-admin',
      dto,
    );
  }
}
