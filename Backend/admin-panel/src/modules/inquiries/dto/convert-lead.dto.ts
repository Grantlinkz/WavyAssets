import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ConvertLeadDto {
  @IsString()
  @IsNotEmpty({ message: 'Full sovereign name is required' })
  fullName!: string;

  @IsEmail({}, { message: 'A valid sovereign user email address is required' })
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsString()
  accessTier?: string; // RETAIL | PRIVATE_WEALTH | INSTITUTIONAL

  @IsOptional()
  @IsString()
  initialKycTier?: string; // TIER_1 | TIER_2 | TIER_3

  @IsOptional()
  @IsNumber()
  @Min(0)
  startingCashBalance?: number;

  @IsOptional()
  @IsString()
  inquiryId?: string;
}
