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
  Headers,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FundBalanceDto } from './dto/fund-balance.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/constants/roles.constant';
import { CurrentAdmin, CurrentAdminPayload } from '../../common/decorators/current-admin.decorator';

@Controller(['admin/users', 'users'])
@UseGuards(AdminAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
  )
  async getUsers(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(
    AdminRole.SUPER_ADMIN,
    AdminRole.TREASURY_OFFICER,
    AdminRole.COMPLIANCE_OFFICER,
    AdminRole.CONCIERGE,
    AdminRole.DESK_LEAD,
  )
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.DESK_LEAD)
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    return this.usersService.create(dto, admin?.id, req.ip);
  }

  @Patch(':id/suspend')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async suspendUser(
    @Param('id') id: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    return this.usersService.suspend(id, admin?.id, req.ip);
  }

  @Patch(':id/unsuspend')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async unsuspendUser(
    @Param('id') id: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    return this.usersService.unsuspend(id, admin?.id, req.ip);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  async deleteUser(
    @Param('id') id: string,
    @Headers('x-confirmation-key') confirmationKey: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    return this.usersService.deleteUser(id, confirmationKey, admin?.id, req.ip);
  }

  @Post(':id/fund-balance')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER)
  async fundBalance(
    @Param('id') id: string,
    @Body() dto: FundBalanceDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
    @Req() req: Request,
  ) {
    return this.usersService.fundBalance(id, dto, admin?.id, req.ip);
  }
}
