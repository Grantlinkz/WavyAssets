import { IsNotEmpty, IsString, IsIBAN, IsBIC } from 'class-validator';

export class UpdateFiatRailDto {
  @IsNotEmpty()
  @IsString()
  beneficiaryName!: string;

  @IsNotEmpty()
  @IsString()
  @IsIBAN()
  swissIban!: string;

  @IsNotEmpty()
  @IsString()
  @IsBIC()
  bicSwift!: string;

  @IsNotEmpty()
  @IsString()
  clearingRail!: string;

  @IsNotEmpty()
  @IsString()
  memoFormat!: string;
}