import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminQueryDto } from './dto/admin-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import { CurrentAdmin, CurrentAdminPayload } from '../../common/decorators/current-admin.decorator';

@Controller(['admin/admins', 'admins'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
  )
  async getAdmins(@Query() query: AdminQueryDto) {
    return this.adminsService.findAll(query);
  }

  @Get(':id')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
  )
  async getAdminById(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  /**
   * Register new administrative personnel - Strictly SUPER_ADMIN only
   */
  @Post()
  @Roles(AdminRole.SUPER_ADMIN)
  async createAdmin(
    @Body() dto: CreateAdminDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminsService.createAdmin(admin?.sub || 'system', dto);
  }

  /**
   * Edit administrative personnel - Strictly SUPER_ADMIN only
   */
  @Patch(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminsService.updateAdmin(admin?.sub || 'system', id, dto);
  }

  /**
   * Suspend administrative personnel - Strictly SUPER_ADMIN only
   */
  @Post(':id/suspend')
  @Roles(AdminRole.SUPER_ADMIN)
  async suspendAdmin(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminsService.toggleSuspension(
      admin?.sub || 'system',
      id,
      true,
      reason,
    );
  }

  /**
   * Unsuspend administrative personnel - Strictly SUPER_ADMIN only
   */
  @Post(':id/unsuspend')
  @Roles(AdminRole.SUPER_ADMIN)
  async unsuspendAdmin(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminsService.toggleSuspension(
      admin?.sub || 'system',
      id,
      false,
      reason,
    );
  }

  /**
   * Permanently delete administrative personnel - Strictly SUPER_ADMIN only
   */
  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  async deleteAdmin(
    @Param('id') id: string,
    @Query('reason') reason: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.adminsService.deleteAdmin(admin?.sub || 'system', id, reason);
  }
}
