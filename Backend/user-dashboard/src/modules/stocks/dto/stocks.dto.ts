import {
  IsString,
  IsNumber,
  IsPositive,
  IsIn,
  IsOptional,
  IsBoolean,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class StockOrderBookQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['NVDA', 'MSFT', 'AAPL', 'SPACEX', 'ANTHROPIC', 'TSLA'], {
    message: 'symbol must be one of: NVDA, MSFT, AAPL, SPACEX, ANTHROPIC, TSLA',
  })
  symbol?: string;
}

export class CreateStockOrderDto {
  @IsString()
  @IsIn(['NVDA', 'MSFT', 'AAPL', 'SPACEX', 'ANTHROPIC', 'TSLA'])
  symbol!: string;

  @IsString()
  @IsIn(['MARKET', 'LIMIT', 'STOP_LOSS'])
  orderType!: 'MARKET' | 'LIMIT' | 'STOP_LOSS';

  @IsString()
  @IsIn(['BUY', 'SELL'])
  side!: 'BUY' | 'SELL';

  @IsNumber()
  @IsPositive()
  shares!: number;

  @ValidateIf((o: CreateStockOrderDto) => o.orderType === 'LIMIT')
  @IsNotEmpty({ message: 'limitPrice is required for LIMIT orders' })
  @ValidateIf((o: CreateStockOrderDto) => o.orderType === 'LIMIT' || o.limitPrice !== undefined)
  @IsNumber({}, { message: 'limitPrice must be a number' })
  @IsPositive({ message: 'limitPrice must be a positive number' })
  limitPrice?: number;
}

export class ToggleDripDto {
  @IsBoolean()
  enabled!: boolean;
}

export interface StockOrderBookResponse {
  symbol: string;
  bids: [price: number, size: number][];
  asks: [price: number, size: number][];
  spread: number;
  vwap: number;
  lastPrice: number;
  timestamp: string;
}

export interface StockPositionResponse {
  id: string;
  symbol: string;
  exchange: string;
  shares: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  beta: number;
  range52w: { low: number; high: number };
  dripEnabled: boolean;
  updatedAt: string;
}
