import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { InquiriesService } from './inquiries.service';
import { UpdateInquiryStatusDto } from './dto/update-status.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';
import { SendSubscriberEmailDto } from './dto/send-subscriber-email.dto';
import { BroadcastSubscribersEmailDto } from './dto/broadcast-subscribers-email.dto';
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

  @Post('subscribers/:id/email')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD, AdminRole.CONCIERGE)
  async sendSubscriberEmail(
    @Param('id') id: string,
    @Body() dto: SendSubscriberEmailDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.inquiriesService.sendSubscriberEmail(id, dto, adminId, req?.ip);
  }

  @Post('subscribers/email/broadcast')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD)
  async broadcastSubscribersEmail(
    @Body() dto: BroadcastSubscribersEmailDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.inquiriesService.broadcastSubscribersEmail(dto, adminId, req?.ip);
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
