import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EmailUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Email subject is required' })
  @MinLength(3, { message: 'Email subject must have at least 3 characters' })
  subject!: string;

  @IsString()
  @IsNotEmpty({ message: 'Email message body is required' })
  @MinLength(5, { message: 'Email message body must have at least 5 characters' })
  message!: string;
}
