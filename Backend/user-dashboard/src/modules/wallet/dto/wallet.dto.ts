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

export class WithdrawalRequestDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  rail!: string;

  @IsString()
  referenceId!: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  cryptoAsset?: string;

  @IsOptional()
  @IsString()
  protocol?: string;

  @IsOptional()
  @IsString()
  destinationAddress?: string;
}

export class DepositReceiptDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsString()
  rail!: string;

  @IsString()
  referenceId!: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsString()
  senderBank?: string;

  @IsOptional()
  @IsString()
  senderIbanOrAddress?: string;

  @IsOptional()
  @IsString()
  wireMemo?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  receiptDataUrl?: string;

  @IsOptional()
  @IsString()
  receiptName?: string;
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
