import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  InitiateAuthDto,
  VerifyOtpDto,
  ExchangeTicketDto,
  InitiateAuthResponseDataDto,
  VerifyOtpResponseDataDto,
  ExchangeResponseDataDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDataDto,
  ResetPasswordDto,
  ResetPasswordResponseDataDto,
} from './dto/auth.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/interfaces/api-response.interface';

@ApiTags('Authentication & Session Gateway')
@Controller('auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction =
      this.configService.get<string>('server.nodeEnv') === 'production';
  }

  @Post('initiate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Step 1: Credential verification and 2FA challenge initiation',
    description:
      'Validates credentials or registration request, generates a 6-digit numeric OTP, and delivers it via Resend email or Telegram Enclave.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Challenge initiated successfully. Ready for step 2 OTP verification.',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid email or password',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 409,
    description: 'Account already registered with this email',
    type: ApiResponseDto,
  })
  async initiate(
    @Body() dto: InitiateAuthDto,
    @Req() req: Request,
  ): Promise<InitiateAuthResponseDataDto> {
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    return this.authService.initiate(dto, clientIp);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Initiate password reset challenge',
    description: 'Verifies account existence and delivers 6-digit password reset OTP challenge via email.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Password reset challenge initiated successfully',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 404,
    description: 'No account found with this email address',
    type: ApiResponseDto,
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Request,
  ): Promise<ForgotPasswordResponseDataDto> {
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    return this.authService.forgotPassword(dto, clientIp);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verify OTP and reset password',
    description: 'Verifies password reset OTP, securely hashes new password, updates user credentials, and revokes active sessions.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid OTP code or challenge expired',
    type: ApiResponseDto,
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
  ): Promise<ResetPasswordResponseDataDto> {
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    return this.authService.resetPassword(dto, clientIp);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Step 2: OTP verification, Production Sandbox Guard, and session generation',
    description:
      'Validates 6-digit OTP code, issues signed JWT access token, sets HttpOnly refresh cookie, and creates a single-use dashboard exchange ticket.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Authentication successful. Tokens issued and dashboard handoff ready.',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid OTP code or challenge expired (>3 attempts)',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 403,
    description: 'Sandbox execution forbidden in production (Production Sandbox Guard)',
    type: ApiResponseDto,
  })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResponseDataDto> {
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await this.authService.verifyOtp(dto, clientIp, userAgent);

    // Set HttpOnly, Secure refresh session cookie
    res.cookie('refreshToken', result.rawRefreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set HttpOnly secure Authentication cookie for frictionless client transition
    res.cookie('wavy_handoff', result.handoffTicket, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/auth/exchange',
      maxAge: 60 * 1000, // 60 seconds single-use TTL
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      handoffTicket: result.handoffTicket,
      dashboardUrl: result.dashboardUrl,
    };
  }

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('wavy_handoff')
  @ApiOperation({
    summary: 'Dashboard hand-off ticket redemption',
    description:
      'Consumes single-use exchange ticket passed via secure cookie or body, burns ticket at rest, and issues authenticated dashboard session.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Ticket redeemed successfully. Dashboard session established.',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid, already consumed, or expired exchange ticket',
    type: ApiResponseDto,
  })
  async exchange(
    @Body() dto: ExchangeTicketDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ExchangeResponseDataDto> {
    const ticket = dto.ticket || req.cookies?.wavy_handoff;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';

    const result = await this.authService.exchangeTicket(ticket, clientIp);

    // Rotate refresh cookie
    res.cookie('refreshToken', result.rawRefreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Clear consumed Authentication cookie
    res.clearCookie('wavy_handoff', { path: '/auth/exchange' });

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Rotate session refresh token',
    description: 'Reads HttpOnly refresh cookie, issues new access token, and rotates refresh session.',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Session refreshed successfully',
    type: ApiResponseDto,
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: ApiResponseDto,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ExchangeResponseDataDto> {
    const rawRefreshToken = req.cookies?.refreshToken;
    const result = await this.authService.refreshToken(rawRefreshToken);

    res.cookie('refreshToken', result.rawRefreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        tier: result.user.tier,
      },
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke authenticated session and clear cookies',
  })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const rawRefreshToken = req.cookies?.refreshToken;
    await this.authService.logout(rawRefreshToken);

    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.clearCookie('wavy_handoff', { path: '/auth/exchange' });

    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get current authenticated user profile',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Current user profile retrieved',
    type: ApiResponseDto,
  })
  getMe(@CurrentUser() user: unknown): unknown {
    return user;
  }
}
