import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  UploadDossierDto,
  UpgradeTierDto,
  TaxPackQueryDto,
  AuditLogQueryDto,
} from './dto/compliance.dto';

@Controller('api/v1/compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  /**
   * Current KYC tier, daily limits, and document checklist
   */
  @Get('status')
  async getComplianceStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.complianceService.getComplianceStatus(user.id);
  }

  /**
   * Uploads encrypted compliance dossier document with malware screening
   */
  @Post('dossier-upload')
  async uploadDossierDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UploadDossierDto,
  ) {
    return this.complianceService.uploadDossierDocument(user.id, dto);
  }

  /**
   * Evaluates and processes KYC tier upgrade request
   */
  @Post('upgrade-tier')
  async requestTierUpgrade(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpgradeTierDto,
  ) {
    return this.complianceService.requestTierUpgrade(user.id, dto);
  }

  /**
   * Consolidated Form 8949 / Schedule D tax pack bundle generator
   */
  @Get('tax/pack')
  async generateTaxPack(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TaxPackQueryDto,
  ) {
    return this.complianceService.generateTaxPack(user.id, query);
  }

  /**
   * Paginated audit logs query for user compliance review
   */
  @Get('audit-logs')
  async getAuditLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AuditLogQueryDto,
  ) {
    return this.complianceService.getAuditLogs(user.id, query);
  }
}
