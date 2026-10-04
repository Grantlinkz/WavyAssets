import { IsString, IsNumber, IsPositive, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export const SUPPORTED_CRYPTO_SYMBOLS = [
  'BTC',
  'ETH',
  'SOL',
  'LINK',
  'AVAX',
  'USDC',
  'BNB',
  'XRP',
  'USDT',
] as const;

export class CreateDcaScheduleDto {
  @IsString()
  @IsIn(SUPPORTED_CRYPTO_SYMBOLS, {
    message: `symbol must be one of: ${SUPPORTED_CRYPTO_SYMBOLS.join(', ')}`,
  })
  symbol!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amountUsd!: number;

  @IsString()
  @IsIn(['DAILY', 'WEEKLY', 'BIWEEKLY', 'BI_WEEKLY', 'MONTHLY'])
  frequency!: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
}

export class CompoundStakingDto {
  @IsString()
  @IsIn(SUPPORTED_CRYPTO_SYMBOLS, {
    message: `symbol must be one of: ${SUPPORTED_CRYPTO_SYMBOLS.join(', ')}`,
  })
  symbol!: string;
}

export enum TaxLotMethod {
  FIFO = 'FIFO',
  LIFO = 'LIFO',
}

export class TaxLotExportQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['FIFO', 'LIFO'], { message: 'method must be either FIFO or LIFO' })
  method?: 'FIFO' | 'LIFO';
}

export class GasPreviewQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['ethereum', 'arbitrum'], { message: 'network must be either ethereum or arbitrum' })
  network?: string;

  @IsOptional()
  @IsString()
  @IsIn(['TRANSFER', 'SWAP', 'STAKE'])
  actionType?: 'TRANSFER' | 'SWAP' | 'STAKE';
}

export interface CryptoHoldingResponse {
  id: string;
  symbol: string;
  name: string;
  custodyType: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValuation: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  stakedAmount: number;
  pendingReward: number;
  apy: number;
  updatedAt: string;
}

export interface GasPreviewResponse {
  network: string;
  baseFeeGwei: number;
  priorityFeeGwei: number;
  maxFeeGwei: number;
  gasLimit: number;
  estimatedCostEth: number;
  estimatedCostUsd: number;
  timestamp: string;
}
