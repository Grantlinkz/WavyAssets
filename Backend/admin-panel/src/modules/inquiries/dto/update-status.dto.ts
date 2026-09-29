import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum InquiryStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  MANDATE_SENT = 'MANDATE_SENT',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateInquiryStatusDto {
  @IsEnum(InquiryStatus, { message: 'status must be NEW, IN_REVIEW, MANDATE_SENT, or ARCHIVED' })
  @IsNotEmpty({ message: 'Mandate status cannot be empty' })
  status!: InquiryStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
