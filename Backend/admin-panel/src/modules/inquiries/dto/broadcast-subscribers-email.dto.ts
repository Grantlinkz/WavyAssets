import { IsNotEmpty, IsOptional, IsString, IsIn, MinLength } from 'class-validator';

export class BroadcastSubscribersEmailDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Subject must be at least 2 characters long' })
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Message content must be at least 5 characters long' })
  message!: string;

  @IsOptional()
  @IsString()
  @IsIn(['ALL', 'CONFIRMED'], { message: 'Filter must be either ALL or CONFIRMED' })
  filter?: 'ALL' | 'CONFIRMED' = 'ALL';
}
