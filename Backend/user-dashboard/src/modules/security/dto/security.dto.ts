import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum AssetRail {
  BTC = 'BTC',
  ETH = 'ETH',
  ERC20_USDC = 'ERC20_USDC',
  WIRE_IBAN = 'WIRE_IBAN',
}

export class CreateWhitelistDestinationDto {
  @IsEnum(AssetRail, { message: 'assetRail must be BTC, ETH, ERC20_USDC, or WIRE_IBAN' })
  assetRail!: AssetRail;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  destinationLabel!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  beneficiaryOrg!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(120)
  addressOrIban!: string;
}

export class SignWhitelistDestinationDto {
  @IsOptional()
  @IsString()
  signerKeyId?: string;

  @IsOptional()
  @IsString()
  webauthnAssertion?: string;

  @IsBoolean()
  signatureConfirmation!: boolean;
}

export class RegisterWebAuthnVerifyDto {
  @IsString()
  @MinLength(8)
  credentialId!: string;

  @IsString()
  @MinLength(16)
  publicKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  deviceLabel?: string;
}

export class AuthWebAuthnVerifyDto {
  @IsString()
  credentialId!: string;

  @IsString()
  assertion!: string;
}
