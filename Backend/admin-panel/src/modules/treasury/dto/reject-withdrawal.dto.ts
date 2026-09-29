import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RejectWithdrawalDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Rejection reason must be at least 5 characters long' })
  reason!: string;
}
