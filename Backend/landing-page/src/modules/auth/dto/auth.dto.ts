import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type UserTier = 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL';
export type AuthMode = 'login' | 'register';

export class InitiateAuthDto {
  @ApiProperty({
    description: 'Corporate or verified email address',
    example: 'investor@familyoffice.ch',
  })
  @IsEmail({}, { message: 'email must be a valid institutional or personal email address' })
  email!: string;

  @ApiProperty({
    description: 'Cryptographic passphrase (minimum 8 characters)',
    example: 'SovereignPass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'passphrase must be at least 8 characters long' })
  @MaxLength(128, { message: 'passphrase cannot exceed 128 characters' })
  passphrase!: string;

  @ApiPropertyOptional({
    description: 'Full legal name or representative entity (required for registration)',
    example: 'Eleanor Vance',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Target investor tier',
    enum: ['RETAIL', 'PRIVATE_WEALTH', 'INSTITUTIONAL'],
    default: 'PRIVATE_WEALTH',
    example: 'INSTITUTIONAL',
  })
  @IsOptional()
  @IsIn(['RETAIL', 'PRIVATE_WEALTH', 'INSTITUTIONAL'], {
    message: 'tier must be RETAIL, PRIVATE_WEALTH, or INSTITUTIONAL',
  })
  tier?: UserTier;

  @ApiProperty({
    description: 'Authentication mode: login or register',
    enum: ['login', 'register'],
    example: 'login',
  })
  @IsIn(['login', 'register'], { message: 'mode must be login or register' })
  mode!: AuthMode;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Unique challenge ID issued during step 1 initiate',
    example: 'f72b21c4-5412-4299-9685-6cf1be8972aa',
  })
  @IsString()
  @IsNotEmpty({ message: 'challengeId is required' })
  challengeId!: string;

  @ApiProperty({
    description: '6-digit numeric verification code dispatched to email or Telegram Enclave',
    example: '492817',
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'otpCode must be a 6-digit numeric string' })
  otpCode!: string;
}

export class ExchangeTicketDto {
  @ApiPropertyOptional({
    description: 'Single-use dashboard exchange ticket (if not passed via HttpOnly cookie)',
    example: 'wavy_ticket_99a88b77c66d21e8...',
  })
  @IsOptional()
  @IsString()
  ticket?: string;
}

export class UserDto {
  @ApiProperty({ example: 'usr_4a5b6c7d8e9f' })
  id!: string;

  @ApiProperty({ example: 'investor@familyoffice.ch' })
  email!: string;

  @ApiPropertyOptional({ example: 'Eleanor Vance' })
  fullName?: string | null;

  @ApiProperty({ example: 'INSTITUTIONAL' })
  tier!: string;
}

export class InitiateAuthResponseDataDto {
  @ApiProperty({ example: 2, description: 'Next step required in auth modal' })
  step!: number;

  @ApiProperty({ example: 'f72b21c4-5412-4299-9685-6cf1be8972aa' })
  challengeId!: string;

  @ApiProperty({ example: 300, description: 'Time-to-live in seconds (5 minutes)' })
  expiresInSeconds!: number;

  @ApiProperty({ example: 'EMAIL', description: 'Primary dispatch channel (EMAIL)' })
  deliveryChannel!: 'EMAIL' | 'TELEGRAM_ENCLAVE';

  @ApiPropertyOptional({ example: 'TELEGRAM_ENCLAVE', description: 'Secondary backup dispatch channel' })
  backupChannel?: 'TELEGRAM_ENCLAVE' | null;

  @ApiProperty({ example: 'i***r@familyoffice.ch' })
  maskedDestination!: string;
}

export class VerifyOtpResponseDataDto {
  @ApiProperty({ type: UserDto })
  user!: UserDto;

  @ApiProperty({ description: 'Short-lived signed JWT access token' })
  accessToken!: string;

  @ApiProperty({
    description: 'Single-use dashboard exchange ticket (also set via secure cookie)',
    example: 'wavy_ticket_99a88b77c66d21e8...',
  })
  handoffTicket!: string;

  @ApiProperty({
    description: 'Target dashboard redirect URL (out-of-band exchange)',
    example: 'http://localhost:5174/auth/exchange',
  })
  dashboardUrl!: string;
}

export class ExchangeResponseDataDto {
  @ApiProperty({ type: UserDto })
  user!: UserDto;

  @ApiProperty({ description: 'Fresh signed JWT access token for dashboard session' })
  accessToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Registered account email address',
    example: 'investor@familyoffice.ch',
  })
  @IsEmail({}, { message: 'email must be a valid institutional or personal email address' })
  email!: string;
}

export class ForgotPasswordResponseDataDto {
  @ApiProperty({ example: 2, description: 'Next step required in auth modal' })
  step!: number;

  @ApiProperty({ example: 'f72b21c4-5412-4299-9685-6cf1be8972aa' })
  challengeId!: string;

  @ApiProperty({ example: 300, description: 'Time-to-live in seconds (5 minutes)' })
  expiresInSeconds!: number;

  @ApiProperty({ example: 'i***r@familyoffice.ch' })
  maskedDestination!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Unique challenge ID issued during forgot-password request',
    example: 'f72b21c4-5412-4299-9685-6cf1be8972aa',
  })
  @IsString()
  @IsNotEmpty({ message: 'challengeId is required' })
  challengeId!: string;

  @ApiProperty({
    description: '6-digit numeric verification code dispatched to email',
    example: '492817',
  })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'otpCode must be a 6-digit numeric string' })
  otpCode!: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePassword123!',
  })
  @IsString()
  @MinLength(6, { message: 'newPassphrase must be at least 6 characters' })
  @MaxLength(128, { message: 'newPassphrase cannot exceed 128 characters' })
  newPassphrase!: string;
}

export class ResetPasswordResponseDataDto {
  @ApiProperty({ example: 'Password reset successfully. You may now sign in.' })
  message!: string;
}
