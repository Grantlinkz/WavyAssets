import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SignOffAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ComplianceAttestationsDto {
  @IsOptional()
  @IsBoolean()
  ibanMatchesMandate?: boolean;

  @IsOptional()
  @IsBoolean()
  liquidityVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  voiceOrHardwareOtpConfirmed?: boolean;
}

export class SignOffWithdrawalDto {
  @IsEnum(SignOffAction, { message: 'Action must be either APPROVE or REJECT' })
  action!: SignOffAction;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  officerToken?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ComplianceAttestationsDto)
  complianceAttestations?: ComplianceAttestationsDto;
}

