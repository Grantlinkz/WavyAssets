import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { ApproveDepositDto } from './dto/approve-deposit.dto';
import { RejectDepositDto } from './dto/reject-deposit.dto';
import { SignOffWithdrawalDto } from './dto/sign-off-withdrawal.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { TreasuryQueryDto } from './dto/treasury-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import { CurrentAdmin, CurrentAdminPayload } from '../../common/decorators/current-admin.decorator';

@Controller(['admin/treasury', 'treasury'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  @Get('pending-deposits')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.DESK_LEAD,
  )
  async getPendingDeposits(@Query() query: TreasuryQueryDto) {
    return this.treasuryService.getPendingDeposits(query);
  }

  @Post('deposits/:id/approve')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER)
  async approveDeposit(
    @Param('id') id: string,
    @Body() dto: ApproveDepositDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.treasuryService.approveDeposit(id, adminId, dto);
  }

  @Post('deposits/:id/reject')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER, AdminRole.COMPLIANCE_OFFICER)
  async rejectDeposit(
    @Param('id') id: string,
    @Body() dto: RejectDepositDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.treasuryService.rejectDeposit(id, adminId, dto);
  }

  @Get('pending-withdrawals')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.DESK_LEAD,
  )
  async getPendingWithdrawals(@Query() query: TreasuryQueryDto) {
    return this.treasuryService.getPendingWithdrawals(query);
  }

  @Post('withdrawals/:id/sign-off')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER)
  async signOffWithdrawal(
    @Param('id') id: string,
    @Body() dto: SignOffWithdrawalDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.treasuryService.signOffWithdrawal(id, adminId, dto);
  }

  @Post('withdrawals/:id/reject-and-refund')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER, AdminRole.COMPLIANCE_OFFICER)
  async rejectAndRefundWithdrawal(
    @Param('id') id: string,
    @Body() dto: RejectWithdrawalDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const adminId = admin?.id || (admin as any)?.sub;
    return this.treasuryService.rejectAndRefundWithdrawal(id, adminId, dto);
  }
}
