import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SignOffAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class SignOffWithdrawalDto {
  @IsEnum(SignOffAction, { message: 'Action must be either APPROVE or REJECT' })
  action!: SignOffAction;

  @IsOptional()
  @IsString()
  notes?: string;
}
