import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VipCardsService } from './vip-cards.service';
import { MintCardDto } from './dto/mint-card.dto';
import { UpdateCardParametersDto } from './dto/update-card-parameters.dto';
import { VipCardQueryDto } from './dto/vip-card-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import {
  CurrentAdmin,
  CurrentAdminPayload,
} from '../../common/decorators/current-admin.decorator';

@Controller(['admin/vip-cards', 'vip-cards'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class VipCardsController {
  constructor(private readonly vipCardsService: VipCardsService) {}

  @Get()
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
  )
  async getCards(@Query() query: VipCardQueryDto) {
    return this.vipCardsService.getCards(query);
  }

  @Get('telemetry')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
  )
  async getTelemetry() {
    return this.vipCardsService.getTelemetry();
  }

  @Get(':id')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
  )
  async getCardById(@Param('id') id: string) {
    return this.vipCardsService.getCardById(id);
  }

  @Post('mint')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONCIERGE)
  async mintCard(
    @Body() dto: MintCardDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.vipCardsService.mintCard(admin?.sub || 'system-admin', dto);
  }

  @Patch(':id/toggle-freeze')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.CONCIERGE,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.DESK_LEAD,
  )
  async toggleFreeze(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.vipCardsService.toggleFreeze(
      id,
      admin?.sub || 'system-admin',
      reason,
    );
  }

  @Patch(':id/parameters')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONCIERGE)
  async updateParameters(
    @Param('id') id: string,
    @Body() dto: UpdateCardParametersDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.vipCardsService.updateParameters(
      id,
      admin?.sub || 'system-admin',
      dto,
    );
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONCIERGE)
  async deleteCard(
    @Param('id') id: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.vipCardsService.deleteCard(id, admin?.sub || 'system-admin');
  }
}
