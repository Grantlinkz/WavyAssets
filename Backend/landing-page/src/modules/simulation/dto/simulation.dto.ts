import {
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
  IsInt,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveSimulationDto {
  @ApiProperty({
    example: 1000000,
    description: 'Target capital deployment amount in USD ($50k to $50M)',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(50000, { message: 'capitalAmount must be at least $50,000 for institutional simulation' })
  @Max(50000000, { message: 'capitalAmount must not exceed $50,000,000' })
  capitalAmount!: number;

  @ApiProperty({
    example: 2,
    description:
      'Risk posture profile (1: Capital Preservation, 2: Balanced Growth, 3: Maximum Alpha)',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(3)
  riskPosture!: number;

  @ApiProperty({
    example: 14.8,
    description: 'Projected annual percentage yield (APY) percentage benchmark (e.g. 14.8)',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1.0)
  @Max(100.0)
  projectedYield!: number;
}

export class SimulationResponseDto {
  @ApiProperty({
    example: 'sim_a3f9c812d094b8e219084728d1c93a0b12e34f56',
    description: 'Cryptographic intent token for client-side persistence and onboarding pre-fill',
  })
  token!: string;

  @ApiProperty({ example: 1000000 })
  capitalAmount!: number;

  @ApiProperty({ example: 2 })
  riskPosture!: number;

  @ApiProperty({ example: 'Balanced Growth' })
  riskLabel!: string;

  @ApiProperty({ example: 14.8 })
  projectedYield!: number;

  @ApiProperty({ example: '2026-10-11T12:00:00.000Z' })
  expiresAt!: string;
}
