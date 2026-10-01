import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  IsPositive,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export const SUPPORTED_CRYPTO_ASSETS = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL'] as const;
export const SUPPORTED_CRYPTO_NETWORKS = [
  'ERC-20',
  'BEP-20',
  'Polygon',
  'TRC-20',
  'Bitcoin Native',
  'Arbitrum',
  'Optimism',
  'Solana Native',
] as const;

export class UpdateCryptoRailDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_CRYPTO_ASSETS)
  asset!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_CRYPTO_NETWORKS)
  network!: string;

  @IsNotEmpty()
  @IsString()
  vaultAddress!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minDepositUsd?: number = 500.0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  confirmations?: number = 3;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  confirmationTimeEst?: string;
}
