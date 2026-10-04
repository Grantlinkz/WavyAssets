import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateFiatRailDto {
  @IsNotEmpty()
  @IsString()
  beneficiaryName!: string;

  @IsOptional()
  @IsString()
  depositoryBank?: string;

  @IsNotEmpty()
  @IsString()
  swissIban!: string;

  @IsNotEmpty()
  @IsString()
  bicSwift!: string;

  @IsNotEmpty()
  @IsString()
  clearingRail!: string;

  @IsNotEmpty()
  @IsString()
  memoFormat!: string;

  @IsOptional()
  @IsString()
  id?: string;
}