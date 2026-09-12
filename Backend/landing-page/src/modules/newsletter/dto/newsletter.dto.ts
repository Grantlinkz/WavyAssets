import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
  @ApiProperty({
    example: 'allocator@swiss-vault.ch',
    description: 'Corporate or private wealth email for institutional research intelligence',
  })
  @IsEmail({}, { message: 'email must be a valid email format' })
  @IsNotEmpty()
  email!: string;
}

export class VerifyNewsletterQueryDto {
  @ApiProperty({
    example: 'd8c47f9a12b04e6c9823f5a1e7b39c04',
    description: 'Cryptographic confirmation token received via email',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class NewsletterResponseDto {
  @ApiProperty({ example: 'Verification link dispatched to institutional email address' })
  message!: string;

  @ApiProperty({ example: 'a***r@swiss-vault.ch' })
  email!: string;

  @ApiProperty({ example: false })
  isConfirmed!: boolean;
}
