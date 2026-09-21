import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ALLOWED_SERVICES = [
  'CRYPTO',
  'STOCKS',
  'AI_FUNDS',
  'REAL_ESTATE',
  'VIP_CARDS',
  'CARS',
  'WALLET',
] as const;

export type LeadServiceType = (typeof ALLOWED_SERVICES)[number];

export const ALLOWED_ALLOCATIONS = [
  '$500K - $1M',
  '$1M - $5M',
  '$5M - $10M',
  '$10M+',
  'CUSTOM',
] as const;

export type LeadAllocationType = (typeof ALLOWED_ALLOCATIONS)[number];

export class LeadInquiryDto {
  @ApiProperty({
    example: 'Alexander von Bern',
    description: 'Full legal or representative name of institutional allocator',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({
    example: 'alexander@bern-capital.ch',
    description: 'Corporate institutional work email (disposable emails blocked)',
  })
  @IsEmail({}, { message: 'workEmail must be a valid email format' })
  @IsNotEmpty()
  workEmail!: string;

  @ApiProperty({
    example: 'Bern Capital AG',
    description: 'Corporate or institutional entity name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  companyName!: string;

  @ApiPropertyOptional({
    example: 'https://bern-capital.ch',
    description: 'Official corporate website URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  websiteUrl?: string;

  @ApiPropertyOptional({
    example: '@alex_bern_vault',
    description: 'Direct institutional Telegram handle for Enclave notifications',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  telegram?: string;

  @ApiProperty({
    enum: ALLOWED_SERVICES,
    example: 'AI_FUNDS',
    description: 'Global asset class or infrastructure service requested',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_SERVICES as unknown as string[], {
    message: `service must be one of: ${ALLOWED_SERVICES.join(', ')}`,
  })
  service!: string;

  @ApiProperty({
    enum: ALLOWED_ALLOCATIONS,
    example: '$5M - $10M',
    description: 'Target capital deployment range',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_ALLOCATIONS as unknown as string[], {
    message: `allocationRange must be one of: ${ALLOWED_ALLOCATIONS.join(', ')}`,
  })
  allocationRange!: string;

  @ApiPropertyOptional({
    example: 'Inquiring regarding custom multi-signature custody integration.',
    description: 'Mandate specifics or technical custody requirements',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Anti-bot honeypot field (must remain empty for human allocators)',
  })
  @IsOptional()
  @IsString()
  honeypot?: string;
}

export class LeadInquiryResponseDto {
  @ApiProperty({ example: 'b62fb91e-358b-4bb8-8686-353d2bfd4e12' })
  inquiryId!: string;

  @ApiProperty({ example: 'PRIORITY_REVIEW' })
  status!: string;

  @ApiProperty({ example: true })
  priority!: boolean;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  receivedAt!: string;

  @ApiProperty({
    example: 'Your institutional capital mandate inquiry has been ingested and queued.',
  })
  message!: string;
}
