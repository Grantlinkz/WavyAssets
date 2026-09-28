import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFiatRailDto {
  @IsNotEmpty()
  @IsString()
  beneficiaryName!: string;

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
}