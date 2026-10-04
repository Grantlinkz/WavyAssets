import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class UpdateFiatRailDto {
  @IsNotEmpty()
  @IsString()
  beneficiaryName!: string;

  @IsOptional()
  @IsString()
  depositoryBank?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{2}\d{2}[\s0-9A-Z]{10,34}$/, {
    message: 'swissIban must be a valid IBAN format',
  })
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