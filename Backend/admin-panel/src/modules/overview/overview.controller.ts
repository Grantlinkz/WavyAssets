import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OverviewService } from './overview.service';
import { SettlementQueryDto } from './dto/settlement-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@Controller(['admin/overview', 'overview'])
@UseGuards(AdminAuthGuard)
export class OverviewController {
  constructor(private readonly overviewService: OverviewService) {}

  @Get('metrics')
  async getMetrics() {
    return this.overviewService.getMetrics();
  }

  @Get('settlements')
  async getSettlements(@Query() query: SettlementQueryDto) {
    return this.overviewService.getSettlementLedger(query);
  }

  @Get('settlement-ledger')
  async getSettlementLedger(@Query() query: SettlementQueryDto) {
    return this.overviewService.getSettlementLedger(query);
  }
}
