import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class VerifyDocumentDto {
  @IsString({ message: 'documentId is required' })
  documentId!: string;

  @IsBoolean({ message: 'isVerified must be a boolean' })
  isVerified!: boolean;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
