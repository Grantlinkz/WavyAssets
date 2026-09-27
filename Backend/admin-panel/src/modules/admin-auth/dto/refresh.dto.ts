import { IsNotEmpty, IsString } from 'class-validator';

export class AdminRefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token cannot be empty' })
  refreshToken!: string;
}
