import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminRefreshTokenDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Refresh token cannot be empty' })
  refreshToken?: string;
}
