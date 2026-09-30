import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { UpdateInquiryStatusDto } from './dto/update-status.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import { CurrentAdmin, CurrentAdminPayload } from '../../common/decorators/current-admin.decorator';

@Controller(['admin/inquiries', 'inquiries'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD, AdminRole.CONCIERGE, AdminRole.COMPLIANCE_OFFICER, AdminRole.TREASURY_OFFICER)
  async getInquiries(
    @Query('status') statusFilter?: string,
    @Query('search') search?: string,
  ) {
    return this.inquiriesService.findAll(statusFilter, search);
  }

  @Get('subscribers')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD, AdminRole.CONCIERGE, AdminRole.COMPLIANCE_OFFICER, AdminRole.TREASURY_OFFICER)
  async getSubscribers() {
    return this.inquiriesService.getSubscribers();
  }

  @Delete('subscribers/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD)
  async deleteSubscriber(@Param('id') id: string) {
    return this.inquiriesService.deleteSubscriber(id);
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD, AdminRole.CONCIERGE, AdminRole.COMPLIANCE_OFFICER, AdminRole.TREASURY_OFFICER)
  async getInquiryById(@Param('id') id: string) {
    return this.inquiriesService.findById(id);
  }

  @Patch(':id/status')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.inquiriesService.updateStatus(id, dto, admin?.fullName);
  }

  @Post(':id/convert')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD, AdminRole.CONCIERGE)
  async convertInquiry(
    @Param('id') id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    return this.inquiriesService.convertLeadToUser(dto, id);
  }
}

/**
 * Controller to satisfy Frontend contract /api/v1/users/convert directly
 */
@Controller(['users', 'admin/users'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class UsersConversionController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post('convert')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD, AdminRole.CONCIERGE)
  async convertUser(@Body() dto: ConvertLeadDto) {
    return this.inquiriesService.convertLeadToUser(dto);
  }
}
