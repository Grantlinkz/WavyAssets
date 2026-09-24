import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RealEstateService } from './real-estate.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ExecuteOtcOrderDto, BuyPropertyDto, SellPropertyDto } from './dto/real-estate.dto';

@Controller('api/v1/real-estate')
@UseGuards(JwtAuthGuard)
export class RealEstateController {
  constructor(private readonly realEstateService: RealEstateService) {}

  /**
   * Fractional prime real estate property catalog with equity positions
   */
  @Get('properties')
  async getProperties(@CurrentUser() user: AuthenticatedUser) {
    return this.realEstateService.getProperties(user.id);
  }

  /**
   * Rental yield distributions and dividend history
   */
  @Get('rental-distributions')
  async getRentalDistributions(@CurrentUser() user: AuthenticatedUser) {
    return this.realEstateService.getRentalDistributions(user.id);
  }

  /**
   * Portfolio tenant occupancy profiles and lease terms
   */
  @Get('occupancy')
  async getOccupancy() {
    return this.realEstateService.getOccupancy();
  }

  /**
   * Secondary P2P OTC Order Book
   */
  @Get('otc-market')
  async getOtcOrders() {
    return this.realEstateService.getOtcOrders();
  }

  /**
   * Executes secondary market share transfer with atomic double-entry ledger settlement
   */
  @Post('otc-market/:orderId/execute')
  async executeOtcOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() dto: ExecuteOtcOrderDto,
  ) {
    return this.realEstateService.executeOtcOrder(user.id, orderId, dto);
  }

  /**
   * Pre-signed secure document vault URL generation
   */
  @Get('documents/:docId')
  async getPresignedDocumentUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Param('docId') docId: string,
  ) {
    return this.realEstateService.getPresignedDocumentUrl(user.id, docId);
  }

  /**
   * Acquire fractional SPV property tokens with ledger debit
   */
  @Post('buy')
  async buyProperty(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BuyPropertyDto,
  ) {
    return this.realEstateService.buyProperty(user.id, dto);
  }

  /**
   * Liquidate fractional SPV property tokens with ledger credit
   */
  @Post('sell')
  async sellProperty(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SellPropertyDto,
  ) {
    return this.realEstateService.sellProperty(user.id, dto);
  }
}
