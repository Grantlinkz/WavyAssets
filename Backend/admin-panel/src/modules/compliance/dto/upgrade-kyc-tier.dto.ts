import {
  IsString,
  IsEnum,
  MinLength,
  IsOptional,
  IsArray,
} from 'class-validator';

export enum KycTargetTier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  INSTITUTIONAL = 'INSTITUTIONAL',
}

export class UpgradeKycTierDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(KycTargetTier, {
    message: 'targetTier must be TIER_1, TIER_2, TIER_3, or INSTITUTIONAL',
  })
  targetTier!: KycTargetTier;

  @IsString()
  @MinLength(5, {
    message: 'approvalNotes must contain at least 5 characters for compliance audit trail',
  })
  approvalNotes!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklist?: string[];
}
