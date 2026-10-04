import { IsOptional, IsString } from 'class-validator';

export class ApproveDepositDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
