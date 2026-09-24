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
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { FiatRampDto, CashSweepDto, FxConvertDto } from './dto/wallet.dto';

@Controller('api/v1/wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Segregated Balances (Available Liquid vs Invested vs Staking Escrow)
   */
  @Get('balances')
  async getBalances(@CurrentUser() user: AuthenticatedUser) {
    return this.walletService.getBalances(user.id);
  }

  /**
   * Fiat Wire On/Off-Ramp (Deposit or Withdrawal with 48h Time-Lock Verification)
   */
  @Post(['fiat-ramp', 'withdraw'])
  async initiateFiatRamp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FiatRampDto,
  ) {
    return this.walletService.initiateFiatRamp(user.id, dto);
  }


  /**
   * Paginated Transaction Ledger
   */
  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.walletService.getTransactions(user.id, page, limit);
  }

  /**
   * Cash Sweep Engine
   */
  @Post('cash-sweep')
  async sweepIdleCash(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CashSweepDto,
  ) {
    return this.walletService.sweepIdleCash(user.id, dto);
  }

  /**
   * Spot FX Conversion
   */
  @Post('fx-convert')
  async convertFx(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FxConvertDto,
  ) {
    return this.walletService.convertFx(user.id, dto);
  }
}
