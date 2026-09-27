import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AdminLoginDto {
  @IsEmail({}, { message: 'A valid sovereign operator email address is required' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Master passphrase cannot be empty' })
  password!: string;

  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'TOTP 2FA code must be exactly 6 digits' })
  totpCode?: string;
}
