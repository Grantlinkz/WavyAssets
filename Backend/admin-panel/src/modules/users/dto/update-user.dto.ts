import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MinLength,
} from 'class-validator';
import { UserTier, KycTier } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(UserTier, { message: 'tier must be RETAIL, PRIVATE_WEALTH, or INSTITUTIONAL' })
  tier?: UserTier;

  @IsOptional()
  @IsEnum(KycTier, { message: 'kycTier must be TIER_1, TIER_2, or TIER_3' })
  kycTier?: KycTier;

  @IsOptional()
  @IsBoolean()
  isCorporate?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'New password must contain at least 6 characters' })
  passphrase?: string;
}
