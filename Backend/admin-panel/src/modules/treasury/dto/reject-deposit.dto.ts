import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RejectDepositDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Rejection reason must be at least 5 characters long' })
  reason!: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
