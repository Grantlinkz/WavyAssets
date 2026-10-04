import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { VipCardTier, VipCardType } from './mint-card.dto';

export enum VipCardStatusFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  IN_TRANSIT = 'IN_TRANSIT',
}

export class VipCardQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(VipCardTier)
  tier?: VipCardTier;

  @IsOptional()
  @IsEnum(VipCardType)
  cardType?: VipCardType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isFrozen?: boolean;

  @IsOptional()
  @IsEnum(VipCardStatusFilter)
  status?: VipCardStatusFilter;
}
