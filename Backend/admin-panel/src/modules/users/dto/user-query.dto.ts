import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  kycTier?: string;

  @IsOptional()
  @IsString()
  status?: string; // 'ALL' | 'Active' | 'Locked' | 'ACTIVE' | 'SUSPENDED'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 50;
}
