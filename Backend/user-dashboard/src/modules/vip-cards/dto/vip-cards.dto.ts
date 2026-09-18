import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum CardType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}

export enum CardTier {
  SILVER = 'SILVER',
  OBSIDIAN = 'OBSIDIAN',
  BLACK = 'BLACK',
}

export class UpdateCardControlsDto {
  @IsOptional()
  @IsBoolean()
  isFrozen?: boolean;

  @IsOptional()
  @IsEnum(CardType, { message: 'cardType must be PHYSICAL or VIRTUAL' })
  cardType?: CardType;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Daily spend limit cannot be negative' })
  @Max(1000000, { message: 'Daily spend limit cannot exceed $1,000,000' })
  dailySpendLimit?: number;
}

export class RevealSensitiveDataDto {
  @IsOptional()
  @IsString()
  passphrase?: string;

  @IsOptional()
  @IsString()
  authAssertion?: string;
}

export enum ConciergeCategory {
  TRAVEL = 'TRAVEL',
  LIFESTYLE = 'LIFESTYLE',
  PRIVATE_DINING = 'PRIVATE_DINING',
  CHARTER = 'CHARTER',
  FINANCIAL = 'FINANCIAL',
}

export enum ConciergeUrgency {
  STANDARD = 'STANDARD',
  PRIORITY = 'PRIORITY',
  IMMEDIATE = 'IMMEDIATE',
}

export class CreateConciergeTicketDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  subject!: string;

  @IsEnum(ConciergeCategory, { message: 'Invalid concierge category' })
  category!: ConciergeCategory;

  @IsEnum(ConciergeUrgency, { message: 'Invalid urgency level' })
  urgency!: ConciergeUrgency;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
