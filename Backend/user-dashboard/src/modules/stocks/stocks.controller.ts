import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CreateStockOrderDto,
  ToggleDripDto,
  StockOrderBookQueryDto,
} from './dto/stocks.dto';

@Controller('api/v1/stocks')
@UseGuards(JwtAuthGuard)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  /**
   * Level-2 simulated order book depth (Top 10 bids/asks, spread, VWAP)
   */
  @Get('order-book')
  getOrderBook(@Query() query: StockOrderBookQueryDto) {
    return this.stocksService.getOrderBook(query.symbol || 'NVDA');
  }

  /**
   * Active positions query with DMA pricing, beta, and 52-week range
   */
  @Get('positions')
  async getPositions(@CurrentUser() user: AuthenticatedUser) {
    return this.stocksService.getPositions(user.id);
  }

  /**
   * Order placement engine (MARKET, LIMIT, STOP_LOSS)
   */
  @Post('orders')
  async placeOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStockOrderDto,
  ) {
    return this.stocksService.placeOrder(user.id, dto);
  }

  /**
   * Cancel pending stock order
   */
  @Delete('orders/:id')
  async cancelOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.stocksService.cancelOrder(user.id, id);
  }

  /**
   * Toggle Dividend Re-Investment Plan (DRIP)
   */
  @Patch('positions/:id/drip')
  async toggleDrip(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ToggleDripDto,
  ) {
    return this.stocksService.toggleDrip(user.id, id, dto.enabled);
  }

  /**
   * Calendar feed of corporate actions (dividends, earnings, splits)
   */
  @Get('corporate-actions')
  getCorporateActions() {
    return this.stocksService.getCorporateActions();
  }
}
