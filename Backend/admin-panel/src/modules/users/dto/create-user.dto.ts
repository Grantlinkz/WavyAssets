import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString({ message: 'Full name is required' })
  fullName!: string;

  @IsOptional()
  @IsString()
  tier?: string = 'PRIVATE_WEALTH'; // RETAIL | PRIVATE_WEALTH | INSTITUTIONAL

  @IsOptional()
  @IsString()
  kycTier?: string = 'TIER_1'; // TIER_1 | TIER_2 | TIER_3

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
