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
} from '@nestjs/common';
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
  ) {
    return this.usersService.create(dto, admin?.sub);
  }

  @Patch(':id/suspend')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async suspendUser(
    @Param('id') id: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.usersService.suspend(id, admin?.sub);
  }

  @Patch(':id/unsuspend')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.COMPLIANCE_OFFICER)
  async unsuspendUser(
    @Param('id') id: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.usersService.unsuspend(id, admin?.sub);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  async deleteUser(
    @Param('id') id: string,
    @Query('confirmationKey') queryKey: string,
    @Headers('x-confirmation-key') headerKey: string,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    const confirmationKey = queryKey || headerKey;
    return this.usersService.deleteUser(id, confirmationKey, admin?.sub);
  }

  @Post(':id/fund-balance')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.TREASURY_OFFICER)
  async fundBalance(
    @Param('id') id: string,
    @Body() dto: FundBalanceDto,
    @CurrentAdmin() admin: CurrentAdminPayload,
  ) {
    return this.usersService.fundBalance(id, dto, admin?.sub);
  }
}
