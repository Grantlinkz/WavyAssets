import { IsString, IsNumber, IsPositive, IsIn, IsOptional, Min } from 'class-validator';

export class FiatRampDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsIn(['USD', 'EUR', 'CHF', 'GBP', 'USDC'])
  currency!: string;

  @IsString()
  @IsIn(['DEPOSIT', 'WITHDRAWAL'])
  direction!: 'DEPOSIT' | 'WITHDRAWAL';

  @IsOptional()
  @IsString()
  destinationId?: string; // Target whitelist destination for withdrawals
}

export class CashSweepDto {
  @IsNumber()
  @IsPositive()
  threshold!: number; // e.g. sweep when available cash > $50,000

  @IsNumber()
  @IsPositive()
  sweepAmount!: number;

  @IsString()
  @IsIn(['USD', 'EUR', 'CHF', 'GBP', 'USDC'])
  currency!: string;
}

export class FxConvertDto {
  @IsString()
  @IsIn(['USD', 'EUR', 'CHF', 'GBP', 'USDC', 'BTC', 'ETH'])
  fromCurrency!: string;

  @IsString()
  @IsIn(['USD', 'EUR', 'CHF', 'GBP', 'USDC', 'BTC', 'ETH'])
  toCurrency!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}

export interface WalletBalancesResponse {
  totalUsd: number;
  availableCash: {
    currency: string;
    amount: number;
    usdEquivalent: number;
  }[];
  investedCapital: {
    currency: string;
    amount: number;
    usdEquivalent: number;
  }[];
  stakingEscrow: {
    currency: string;
    amount: number;
    usdEquivalent: number;
  }[];
  lastUpdated: string;
}

export interface LedgerTransactionResponse {
  id: string;
  referenceId: string;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  entries: {
    id: string;
    accountId: string;
    accountType: string;
    currency: string;
    amount: string;
  }[];
}
