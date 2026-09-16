import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format. Expected Bearer <token>');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthenticatedUser>(token);
      (request as Request & { user?: AuthenticatedUser }).user = {
        id: payload.id || (payload as unknown as Record<string, string>)['sub'],
        email: payload.email,
        fullName: payload.fullName,
        tier: payload.tier,
        kycTier: payload.kycTier,
        isCorporate: payload.isCorporate,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Access token is expired, malformed, or invalid');
    }
  }
}
