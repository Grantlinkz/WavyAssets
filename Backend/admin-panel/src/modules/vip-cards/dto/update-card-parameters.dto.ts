import { IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { VipCardType, VipShippingStatus } from './mint-card.dto';

export class UpdateCardParametersDto {
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(1000000)
  dailySpendLimit?: number;

  @IsOptional()
  @IsEnum(VipCardType)
  cardType?: VipCardType;

  @IsOptional()
  @IsEnum(VipShippingStatus)
  shippingStatus?: VipShippingStatus;
}
