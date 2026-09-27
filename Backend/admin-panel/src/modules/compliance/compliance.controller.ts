import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { UpgradeKycTierDto } from './dto/upgrade-kyc-tier.dto';
import { VerifyDocumentDto } from './dto/verify-document.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import { CurrentAdmin, CurrentAdminPayload } from '../../common/decorators/current-admin.decorator';

@Controller(['admin/compliance', 'compliance'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('queue')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER, AdminRole.DESK_LEAD)
  async getQueue(
    @Query('search') search?: string,
    @Query('tier') tier?: string,
  ) {
    return this.complianceService.getQueue({ search, tier });
  }

  @Get('documents/:docId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async getDocument(@Param('docId') docId: string) {
    return this.complianceService.getDocument(docId);
  }

  @Post('verify-document')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async verifyDocument(
    @Body() dto: VerifyDocumentDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.complianceService.verifyDocument(dto, admin?.sub);
  }

  @Post('upgrade-tier')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async upgradeTierBody(
    @Body() dto: UpgradeKycTierDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required in payload');
    }
    return this.complianceService.upgradeTier(dto.userId, dto, admin?.sub);
  }

  @Post(':id/upgrade-tier')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async upgradeTierParam(
    @Param('id') userId: string,
    @Body() dto: UpgradeKycTierDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.complianceService.upgradeTier(userId, dto, admin?.sub);
  }
}
