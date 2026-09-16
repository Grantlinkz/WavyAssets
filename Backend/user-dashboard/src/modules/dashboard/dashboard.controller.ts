import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CommandBarResponse } from './dto/command-bar.dto';
import { ActionRailResponse } from './dto/action-rail.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Universal Command Bar Aggregate Endpoint
   * Returns consolidated net worth, multi-horizon returns, 7-asset allocation matrix, and KYC limits.
   */
  @Get('command-bar')
  async getCommandBar(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CommandBarResponse> {
    return this.dashboardService.getCommandBarData(user.id);
  }

  /**
   * Global Action Rail Status & Capability Endpoint
   * Returns KYC tier allowances, daily limits, destination states, and eligibility flags.
   */
  @Get('action-rail')
  async getActionRail(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActionRailResponse> {
    return this.dashboardService.getActionRail(user.id);
  }
}
