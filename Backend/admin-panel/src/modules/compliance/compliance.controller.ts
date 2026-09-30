import {
  Controller,
  Get,
  Post,
  Patch,
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

  @Get(['queue', 'dossiers'])
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER, AdminRole.DESK_LEAD)
  async getQueue(
    @Query('search') search?: string,
    @Query('tier') tier?: string,
  ) {
    return this.complianceService.getQueue({ search, tier });
  }

  @Get('dossiers/:dossierId')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER, AdminRole.DESK_LEAD)
  async getDossier(@Param('dossierId') dossierId: string) {
    return this.complianceService.getDossierById(dossierId);
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
    return this.complianceService.verifyDocument(dto, admin?.id);
  }

  @Post(['dossiers/:dossierId/elevate', 'upgrade-tier'])
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async upgradeTierBody(
    @Param('dossierId') paramDossierId: string | undefined,
    @Body() dto: any,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const rawUserId = paramDossierId
      ? paramDossierId.replace('dossier-', '')
      : dto.userId || dto.dossierId?.replace('dossier-', '');
    if (!rawUserId) {
      throw new BadRequestException('userId or dossierId is required in payload');
    }
    return this.complianceService.upgradeTier(
      rawUserId,
      {
        targetTier: dto.targetTier || 'INSTITUTIONAL',
        approvalNotes: dto.approvalNotes || dto.finmaSignOffNotes || 'Compliance tier upgrade approved',
        checklist: dto.checklist || [],
      } as any,
      admin?.id,
    );
  }

  @Post(':id/upgrade-tier')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async upgradeTierParam(
    @Param('id') userId: string,
    @Body() dto: UpgradeKycTierDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.complianceService.upgradeTier(userId, dto, admin?.id);
  }

  @Post('dossiers/:dossierId/reject')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async rejectDossier(
    @Param('dossierId') dossierId: string,
    @Body() dto: any,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.complianceService.rejectDossier(dossierId, dto, admin?.id);
  }

  @Patch('dossiers/:dossierId/checklist')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async updateChecklist(
    @Param('dossierId') dossierId: string,
    @Body() dto: any,
  ) {
    return this.complianceService.updateChecklist(dossierId, dto);
  }
}
