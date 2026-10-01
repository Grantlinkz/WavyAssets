import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';

@Controller(['admin/audit', 'audit'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get(['', 'logs'])
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.TREASURY_OFFICER,
    AdminRole.DESK_LEAD,
  )
  async getAuditLogs(@Query() query: AuditQueryDto) {
    return this.auditService.getAuditLogs(query);
  }

  @Get('telemetry')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.TREASURY_OFFICER,
    AdminRole.DESK_LEAD,
  )
  async getTelemetry() {
    return this.auditService.getTelemetry();
  }

  @Get('export')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async exportCompliance(@Query() query: AuditQueryDto) {
    return this.auditService.generateComplianceExport(query);
  }

  @Get(['logs/:id', ':id'])
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.TREASURY_OFFICER,
    AdminRole.DESK_LEAD,
  )
  async getAuditLogById(@Param('id') id: string) {
    return this.auditService.getAuditLogById(id);
  }
}
