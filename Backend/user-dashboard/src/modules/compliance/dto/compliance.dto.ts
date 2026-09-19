import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum KycDocumentType {
  PASSPORT = 'PASSPORT',
  GOVERNMENT_ID = 'GOVERNMENT_ID',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT',
  ARTICLES_OF_INC = 'ARTICLES_OF_INC',
  TAX_AFFIDAVIT = 'TAX_AFFIDAVIT',
  SOURCE_OF_WEALTH = 'SOURCE_OF_WEALTH',
}

export enum KycTierLevel {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
}

export enum TaxPackFormat {
  JSON = 'JSON',
  CSV = 'CSV',
}

export class UploadDossierDto {
  @IsEnum(KycDocumentType, { message: 'Invalid KYC document type' })
  docType!: KycDocumentType;

  @IsString()
  @MinLength(5)
  fileUrl!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Level 2 KYC Metadata
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  // Level 3 KYC Metadata
  @IsOptional()
  @IsString()
  providerOrBank?: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsOptional()
  @IsString()
  billIssueDate?: string;
}

export class UpgradeTierDto {
  @IsIn([KycTierLevel.TIER_2, KycTierLevel.TIER_3], {
    message: 'targetTier must be TIER_2 or TIER_3',
  })
  targetTier!: KycTierLevel;

  @IsBoolean()
  declarationAcknowledged!: boolean;
}

export class TaxPackQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  @Max(2030)
  year?: number;

  @IsOptional()
  @IsEnum(TaxPackFormat, { message: 'format must be JSON or CSV' })
  format?: TaxPackFormat;
}

export class AuditLogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
