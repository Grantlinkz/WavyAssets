import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Header,
} from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CreateDcaScheduleDto,
  CompoundStakingDto,
  GasPreviewQueryDto,
  TaxLotExportQueryDto,
} from './dto/crypto.dto';

@Controller('api/v1/crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  /**
   * Multi-custody crypto balances (Vault vs Web3 vs Staked)
   */
  @Get('holdings')
  async getHoldings(@CurrentUser() user: AuthenticatedUser) {
    return this.cryptoService.getHoldings(user.id);
  }

  /**
   * EIP-1559 Mempool Gas Estimation Preview
   */
  @Get('gas-preview')
  getGasPreview(@Query() query: GasPreviewQueryDto) {
    return this.cryptoService.getGasPreview(query.network, query.actionType);
  }

  /**
   * Get all active and paused DCA schedules for user
   */
  @Get('dca-schedules')
  async getDcaSchedules(@CurrentUser() user: AuthenticatedUser) {
    return this.cryptoService.getDcaSchedules(user.id);
  }

  /**
   * Create automated DCA recurring buy schedule
   */
  @Post('dca-schedules')
  async createDcaSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDcaScheduleDto,
  ) {
    return this.cryptoService.createDcaSchedule(user.id, dto);
  }

  /**
   * Toggle DCA schedule active status
   */
  @Patch('dca-schedules/:id/toggle')
  async toggleDcaSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.cryptoService.toggleDcaSchedule(user.id, id);
  }

  /**
   * Delete DCA schedule and refund unexecuted reservation to available cash
   */
  @Delete('dca-schedules/:id')
  async deleteDcaSchedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.cryptoService.deleteDcaSchedule(user.id, id);
  }

  /**
   * Re-invest accrued staking rewards into principal
   */
  @Post('staking/compound')
  async compoundStaking(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompoundStakingDto,
  ) {
    return this.cryptoService.compoundStaking(user.id, dto);
  }

  /**
   * Downloadable CSV Tax Lot export
   */
  @Get('tax-lot-export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="wavyassets-tax-lots.csv"')
  async exportTaxLots(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TaxLotExportQueryDto,
  ) {
    return this.cryptoService.exportTaxLots(user.id, query.method);
  }
}
