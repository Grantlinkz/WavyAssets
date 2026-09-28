import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Session expired or unauthorized');
    }

    try {
      const secret =
        process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_SECRET ||
        'wavy_admin_jwt_access_super_secret_sovereign_enclave_2026';

      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (payload.type && payload.type !== 'ADMIN') {
        throw new UnauthorizedException('Invalid administrative principal');
      }

      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
      });

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException('Operator identity inactive or revoked');
      }

      request.admin = {
        id: admin.id,
        sub: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      };
      request.user = request.admin;

      return true;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Session expired or unauthorized');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    if (request.cookies?.wavy_admin_token) {
      return request.cookies.wavy_admin_token;
    }
    if (request.headers['x-admin-token']) {
      return request.headers['x-admin-token'];
    }
    return undefined;
  }
}
