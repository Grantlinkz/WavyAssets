import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCryptoRailDto {
  @IsNotEmpty()
  @IsString()
  asset!: string;

  @IsNotEmpty()
  @IsString()
  network!: string;

  @IsNotEmpty()
  @IsString()
  vaultAddress!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minDepositUsd?: number = 500.0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  confirmations?: number = 3;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
