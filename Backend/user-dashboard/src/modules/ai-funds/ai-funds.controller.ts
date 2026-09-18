import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AiFundsService } from './ai-funds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  SetRiskTierDto,
  ToggleCircuitBreakerDto,
  SimulateRebalanceDto,
} from './dto/ai-funds.dto';

@Controller('api/v1/ai-funds')
@UseGuards(JwtAuthGuard)
export class AiFundsController {
  constructor(private readonly aiFundsService: AiFundsService) {}

  /**
   * Quantitative fund telemetry and risk metrics
   */
  @Get(['metrics', 'telemetry'])
  async getMetrics(@CurrentUser() user: AuthenticatedUser) {
    return this.aiFundsService.getMetrics(user.id);
  }

  /**
   * Calibrate fund strategy risk tier (preservation | balanced | high-vol)
   */
  @Post('risk-tier')
  async setRiskTier(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetRiskTierDto,
  ) {
    return this.aiFundsService.setRiskTier(user.id, dto);
  }

  /**
   * Scannable immutable audit log of algorithmic execution decisions
   */
  @Get('rationale-feed')
  async getRationaleFeed(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.aiFundsService.getRationaleFeed(limit);
  }

  /**
   * H100 GPU compute cluster telemetry and user accrued yield
   */
  @Get('compute-yield')
  async getComputeYield(@CurrentUser() user: AuthenticatedUser) {
    return this.aiFundsService.getComputeYield(user.id);
  }

  /**
   * Claims accrued GPU compute revenue into platform wallet available cash
   */
  @Post('claim-yield')
  async claimComputeYield(@CurrentUser() user: AuthenticatedUser) {
    return this.aiFundsService.claimComputeYield(user.id);
  }

  /**
   * Emergency circuit breaker toggle
   */
  @Post('circuit-breaker')
  async toggleCircuitBreaker(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ToggleCircuitBreakerDto,
  ) {
    return this.aiFundsService.toggleCircuitBreaker(user.id, dto);
  }

  /**
   * Algorithmic rebalance execution (strictly guarded by circuit breaker invariant)
   */
  @Post('rebalance')
  async rebalance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SimulateRebalanceDto,
  ) {
    return this.aiFundsService.rebalance(user.id, dto);
  }
}
