import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcknowledgeComplianceDto {
  @ApiProperty({
    example: 'SEC_RULE_206_4_1_ACK',
    description: 'Regulatory or compliance disclosure action identifier',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  action!: string;

  @ApiPropertyOptional({
    example: 'd9b3a72e-3245-4df3-a128-d88194e921d2',
    description: 'User or session identifier if authenticated',
  })
  @IsOptional()
  @IsString()
  actorId?: string;

  @ApiPropertyOptional({
    example: { version: '2026.1', jurisdiction: 'CH-FINMA', consented: true },
    description: 'Structured disclosure metadata (version, jurisdiction, etc.)',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ComplianceAckResponseDto {
  @ApiProperty({ example: '87f3b89e-2234-4bc1-9081-391840abdf19' })
  auditId!: string;

  @ApiProperty({ example: 'SEC_RULE_206_4_1_ACK' })
  action!: string;

  @ApiProperty({ example: '2026-09-11T12:00:00.000Z' })
  acknowledgedAt!: string;

  @ApiProperty({ example: 'Compliance disclosure acknowledgment cryptographically recorded in audit vault.' })
  message!: string;
}
