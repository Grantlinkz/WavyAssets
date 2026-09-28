import { IsString, IsNotEmpty, MinLength, Equals, IsOptional } from 'class-validator';

export class FreezePlatformDto {
  @IsString()
  @IsNotEmpty()
  @Equals('CONFIRM EMERGENCY PLATFORM FREEZE', {
    message: 'verificationPhrase must exactly match "CONFIRM EMERGENCY PLATFORM FREEZE"',
  })
  verificationPhrase!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(15, {
    message: 'Documented incident justification must be at least 15 characters per Swiss FINMA Statutory Record',
  })
  reason!: string;

  @IsOptional()
  @IsString()
  secondaryOfficerId?: string;

  @IsOptional()
  @IsString()
  secondaryOfficerToken?: string;
}
