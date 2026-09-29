import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEnum } from 'class-validator';
import { UserTier, KycTier } from '../../users/dto/create-user.dto';

export { UserTier, KycTier };

export class ConvertLeadDto {
  @IsString()
  @IsNotEmpty({ message: 'Full Supreme name is required' })
  fullName!: string;

  @IsEmail({}, { message: 'A valid Supreme user email address is required' })
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsEnum(UserTier, { message: 'accessTier must be RETAIL, PRIVATE_WEALTH, or INSTITUTIONAL' })
  accessTier?: UserTier;

  @IsOptional()
  @IsEnum(KycTier, { message: 'initialKycTier must be TIER_1, TIER_2, or TIER_3' })
  initialKycTier?: KycTier;

  @IsOptional()
  @IsNumber()
  @Min(0)
  startingCashBalance?: number;

  @IsOptional()
  @IsString()
  inquiryId?: string;
}
