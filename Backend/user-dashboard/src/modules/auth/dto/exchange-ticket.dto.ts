import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ExchangeTicketDto {
  @IsNotEmpty({ message: 'Ticket cannot be empty' })
  @IsString({ message: 'Ticket must be a string' })
  @Length(16, 256, { message: 'Ticket length must be between 16 and 256 characters' })
  ticket!: string;
}
