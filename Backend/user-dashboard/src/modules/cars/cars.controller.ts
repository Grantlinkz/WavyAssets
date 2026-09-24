import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateDriveBookingDto } from './dto/cars.dto';

@Controller('api/v1/cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  /**
   * Exotic vehicle & horology vault inventory with user holdings
   */
  @Get(['inventory', 'vault-inventory'])
  async getInventory(@CurrentUser() user: AuthenticatedUser) {
    return this.carsService.getInventory(user.id);
  }

  /**
   * Dynamic price tracking synchronized with Hagerty indices and auction comps
   */
  @Get('valuations')
  async getValuations() {
    return this.carsService.getValuations();
  }

  /**
   * Real-time bonded vault climate and security telemetry
   */
  @Get('logistics')
  async getVaultLogistics() {
    return this.carsService.getVaultLogistics();
  }

  /**
   * Fleet rental monetization ledger and commercial charter logs
   */
  @Get('fleet-monetization')
  async getFleetMonetization(@CurrentUser() user: AuthenticatedUser) {
    return this.carsService.getFleetMonetization(user.id);
  }

  /**
   * Calendar booking engine for allocating track days
   */
  @Post('drive-bookings')
  async bookDriveSlot(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDriveBookingDto,
  ) {
    return this.carsService.bookDriveSlot(user.id, dto);
  }

  /**
   * Cryptographically verified vehicle provenance and maintenance history
   */
  @Get(':carId/provenance')
  async getVehicleProvenance(@Param('carId') carId: string) {
    return this.carsService.getVehicleProvenance(carId);
  }

  /**
   * Acquire vehicle asset or fractional share with ledger debit
   */
  @Post('buy')
  async buyVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { assetId: string; price: number; purchaseType?: string; fractionalPct?: number },
  ) {
    return this.carsService.buyVehicle(user.id, body);
  }

  /**
   * Liquidate vehicle share with ledger credit
   */
  @Post('sell')
  async sellVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { assetId: string; proceeds: number },
  ) {
    return this.carsService.sellVehicle(user.id, body);
  }
}
