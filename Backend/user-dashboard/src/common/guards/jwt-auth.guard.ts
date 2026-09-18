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
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        algorithms: ['HS256'],
        issuer: 'wavyassets.com',
        audience: 'wavyassets-client',
      });

      const id =
        typeof payload.id === 'string' && payload.id.trim()
          ? payload.id
          : typeof payload.sub === 'string' && payload.sub.trim()
            ? payload.sub
            : null;
      const email =
        typeof payload.email === 'string' && payload.email.trim() ? payload.email : null;
      const tier =
        typeof payload.tier === 'string' && payload.tier.trim() ? payload.tier : null;
      const kycTier =
        typeof payload.kycTier === 'string' && payload.kycTier.trim() ? payload.kycTier : null;
      const isCorporate =
        typeof payload.isCorporate === 'boolean' ? payload.isCorporate : null;

      if (!id || !email || !tier || !kycTier || isCorporate === null) {
        throw new UnauthorizedException(
          'Access token is missing required claims or contains invalid types',
        );
      }

      (request as Request & { user?: AuthenticatedUser }).user = {
        id,
        email,
        fullName: typeof payload.fullName === 'string' ? payload.fullName : null,
        tier,
        kycTier,
        isCorporate,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Access token is expired, malformed, or invalid');
    }
  }
}
