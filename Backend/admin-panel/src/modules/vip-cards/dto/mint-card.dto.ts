import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
  Matches,
} from 'class-validator';

export enum VipCardTier {
  OBSIDIAN = 'OBSIDIAN',
  BLACK = 'BLACK',
  SILVER = 'SILVER',
  Supreme = 'Supreme',
  TITANIUM = 'TITANIUM',
  CELEBRITY = 'CELEBRITY',
}

export enum VipCardType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}

export enum VipShippingStatus {
  DELIVERED = 'DELIVERED',
  IN_TRANSIT = 'IN_TRANSIT',
  VAULT_STORED = 'VAULT_STORED',
}

export class MintCardDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsEnum(VipCardTier)
  tier?: VipCardTier = VipCardTier.OBSIDIAN;

  @IsOptional()
  @IsEnum(VipCardType)
  cardType?: VipCardType = VipCardType.PHYSICAL;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  dailySpendLimit?: number = 50000.0;

  @IsOptional()
  @IsEnum(VipShippingStatus)
  shippingStatus?: VipShippingStatus = VipShippingStatus.IN_TRANSIT;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4,6}$/, {
    message: 'temporaryPin must be a 4-to-6 digit numeric string',
  })
  temporaryPin?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'cardNumberLast4 must be exactly 4 digits',
  })
  cardNumberLast4?: string;

  @IsOptional()
  @IsString()
  cardholderName?: string;

  @IsOptional()
  @IsString()
  substrate?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  operatorNotes?: string;

  @IsOptional()
  @IsString()
  validDate?: string;

  @IsOptional()
  @IsString()
  celebrityCardholderLabel?: string;
}
