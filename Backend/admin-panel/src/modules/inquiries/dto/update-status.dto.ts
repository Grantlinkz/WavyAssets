import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateInquiryStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'Mandate status cannot be empty' })
  status!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
