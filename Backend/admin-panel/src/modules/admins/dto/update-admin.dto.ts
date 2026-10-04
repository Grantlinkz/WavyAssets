import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../../../common/constants/roles.constant';

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  passphrase?: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
