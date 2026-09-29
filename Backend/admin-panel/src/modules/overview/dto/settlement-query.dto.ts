import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class SettlementQueryDto {
  @IsOptional()
  @IsIn(['24h', '7d', '30d', 'all', '24H', '7D', '30D', 'ALL'], {
    message: 'timeHorizon must be one of: 24h, 7d, 30d, all',
  })
  timeHorizon?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Matches(/^[1-9][0-9]*$/, { message: 'limit must be a positive integer' })
  limit?: string;

  @IsOptional()
  @Matches(/^[1-9][0-9]*$/, { message: 'page must be a positive integer' })
  page?: string;
}
