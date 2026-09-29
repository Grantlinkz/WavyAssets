import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  IsEnum,
} from 'class-validator';

export enum UserTier {
  RETAIL = 'RETAIL',
  PRIVATE_WEALTH = 'PRIVATE_WEALTH',
  INSTITUTIONAL = 'INSTITUTIONAL',
}

export enum KycTier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString({ message: 'Full name is required' })
  fullName!: string;

  @IsOptional()
  @IsEnum(UserTier, { message: 'tier must be RETAIL, PRIVATE_WEALTH, or INSTITUTIONAL' })
  tier?: UserTier = UserTier.PRIVATE_WEALTH;

  @IsOptional()
  @IsEnum(KycTier, { message: 'kycTier must be TIER_1, TIER_2, or TIER_3' })
  kycTier?: KycTier = KycTier.TIER_1;

  @IsOptional()
  @IsNumber({}, { message: 'Starting cash balance must be a number' })
  @Min(0, { message: 'Starting cash balance cannot be negative' })
  startingCashBalance?: number = 0;

  @IsOptional()
  @IsBoolean()
  isCorporate?: boolean = false;

  @IsOptional()
  @IsString()
  passphrase?: string;
}
