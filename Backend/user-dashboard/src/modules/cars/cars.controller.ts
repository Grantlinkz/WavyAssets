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
  @Get('inventory')
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
}
