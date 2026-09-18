import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { VipCardsService } from './vip-cards.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  UpdateCardControlsDto,
  RevealSensitiveDataDto,
  CreateConciergeTicketDto,
} from './dto/vip-cards.dto';

@Controller('api/v1/vip-cards')
@UseGuards(JwtAuthGuard)
export class VipCardsController {
  constructor(private readonly vipCardsService: VipCardsService) {}

  /**
   * Active card status, tier badge, and spending limits
   */
  @Get('status')
  async getCardStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.vipCardsService.getCardStatus(user.id);
  }

  /**
   * Update card controls (freeze, type, daily spending limit)
   */
  @Patch('controls')
  async updateCardControls(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCardControlsDto,
  ) {
    return this.vipCardsService.updateCardControls(user.id, dto);
  }

  /**
   * Ephemeral 60-second CVV & PIN generation protected by WebAuthn/passphrase
   */
  @Post('reveal-sensitive')
  async revealSensitive(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RevealSensitiveDataDto,
  ) {
    return this.vipCardsService.revealSensitive(user.id, dto);
  }

  /**
   * Returns bespoke tier privileges and fee schedules
   */
  @Get('privileges')
  async getPrivileges(@CurrentUser() user: AuthenticatedUser) {
    return this.vipCardsService.getPrivileges(user.id);
  }

  /**
   * Physical card courier shipping tracker
   */
  @Get('shipping-tracker')
  async getShippingTracker(@CurrentUser() user: AuthenticatedUser) {
    return this.vipCardsService.getShippingTracker(user.id);
  }

  /**
   * Dispatches authenticated concierge service request
   */
  @Post('concierge')
  async createConciergeTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConciergeTicketDto,
  ) {
    return this.vipCardsService.createConciergeTicket(user.id, dto);
  }
}
