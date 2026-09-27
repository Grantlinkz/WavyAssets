import {
  IsString,
  IsNumber,
  IsEnum,
  Min,
  MinLength,
  IsOptional,
} from 'class-validator';

export enum LedgerAccountType {
  AVAILABLE_CASH = 'AVAILABLE_CASH',
  INVESTED_CAPITAL = 'INVESTED_CAPITAL',
  STAKING_ESCROW = 'STAKING_ESCROW',
  FEE_RECEIVABLE = 'FEE_RECEIVABLE',
}

export enum BalanceFundDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class FundBalanceDto {
  @IsEnum(LedgerAccountType, {
    message: 'accountType must be AVAILABLE_CASH, INVESTED_CAPITAL, STAKING_ESCROW, or FEE_RECEIVABLE',
  })
  accountType!: LedgerAccountType;

  @IsOptional()
  @IsString()
  currency: string = 'USD';

  @IsNumber({}, { message: 'amount must be a valid number' })
  @Min(0.01, { message: 'amount must be strictly positive (min $0.01)' })
  amount!: number;

  @IsEnum(BalanceFundDirection, {
    message: 'direction must be CREDIT or DEBIT',
  })
  direction!: BalanceFundDirection;

  @IsString()
  @MinLength(5, {
    message: 'auditReason is mandatory and must contain at least 5 characters for compliance audit trails',
  })
  auditReason!: string;

  @IsString()
  @MinLength(3, {
    message: 'referenceId is required as a unique idempotency key',
  })
  referenceId!: string;
}
