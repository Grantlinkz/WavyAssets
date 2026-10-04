import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';

export enum SignOffAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ComplianceAttestationsDto {
  @IsOptional()
  ibanMatchesMandate?: boolean;

  @IsOptional()
  liquidityVerified?: boolean;

  @IsOptional()
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
  @IsObject()
  complianceAttestations?: ComplianceAttestationsDto;
}

