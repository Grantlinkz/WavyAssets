import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  CreateWhitelistDestinationDto,
  SignWhitelistDestinationDto,
  RegisterWebAuthnVerifyDto,
  AuthWebAuthnVerifyDto,
} from './dto/security.dto';

@Controller('api/v1/security')
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  // ============================================================================
  // Session Governance Endpoints
  // ============================================================================

  @Get('sessions')
  async getSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.securityService.getSessions(user.id);
  }

  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') sessionId: string,
  ) {
    return this.securityService.revokeSession(user.id, sessionId);
  }

  @Post('sessions/revoke-others')
  async revokeOtherSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.securityService.revokeOtherSessions(user.id);
  }

  // ============================================================================
  // FIDO2 / WebAuthn Hardware Keys
  // ============================================================================

  @Post('webauthn/register-challenge')
  async generateWebAuthnChallenge(@CurrentUser() user: AuthenticatedUser) {
    return this.securityService.generateWebAuthnChallenge(user.id);
  }

  @Post('webauthn/register-verify')
  async verifyWebAuthnRegistration(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterWebAuthnVerifyDto,
  ) {
    return this.securityService.verifyWebAuthnRegistration(user.id, dto);
  }

  @Post('webauthn/auth-challenge')
  async generateAuthChallenge(@CurrentUser() user: AuthenticatedUser) {
    return this.securityService.generateAuthChallenge(user.id);
  }

  @Post('webauthn/auth-verify')
  async verifyWebAuthnAssertion(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AuthWebAuthnVerifyDto,
  ) {
    return this.securityService.verifyWebAuthnAssertion(user.id, dto);
  }

  @Get('webauthn/credentials')
  async getCredentials(@CurrentUser() user: AuthenticatedUser) {
    return this.securityService.getCredentials(user.id);
  }

  @Delete('webauthn/credentials/:id')
  async deleteCredential(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') credentialId: string,
  ) {
    return this.securityService.deleteCredential(user.id, credentialId);
  }

  // ============================================================================
  // Inviolable 48-Hour Withdrawal Whitelist Time-Lock Endpoints
  // ============================================================================

  @Get('whitelist-destinations')
  async getWhitelistDestinations(@CurrentUser() user: AuthenticatedUser) {
    return this.securityService.getWhitelistDestinations(user.id);
  }

  @Post('whitelist-destinations')
  async createWhitelistDestination(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWhitelistDestinationDto,
  ) {
    return this.securityService.createWhitelistDestination(user.id, dto);
  }

  @Post('whitelist-destinations/:id/sign')
  async signWhitelistDestination(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') destinationId: string,
    @Body() dto: SignWhitelistDestinationDto,
  ) {
    return this.securityService.signWhitelistDestination(user.id, destinationId, dto);
  }

  @Delete('whitelist-destinations/:id')
  async revokeWhitelistDestination(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') destinationId: string,
  ) {
    return this.securityService.revokeWhitelistDestination(user.id, destinationId);
  }
}
