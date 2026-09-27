import { IsOptional, IsString } from 'class-validator';

export class SettlementQueryDto {
  @IsOptional()
  @IsString()
  timeHorizon?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  page?: string;
}
