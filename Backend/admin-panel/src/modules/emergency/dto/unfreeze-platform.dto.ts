import { IsString, IsNotEmpty, MinLength, Equals, IsOptional } from 'class-validator';

export class UnfreezePlatformDto {
  @IsString()
  @IsNotEmpty()
  @Equals('CONFIRM EMERGENCY PLATFORM UNFREEZE', {
    message: 'verificationPhrase must exactly match "CONFIRM EMERGENCY PLATFORM UNFREEZE"',
  })
  verificationPhrase!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(15, {
    message: 'Documented unfreeze justification must be at least 15 characters',
  })
  reason!: string;

  @IsOptional()
  @IsString()
  secondaryOfficerId?: string;
}
