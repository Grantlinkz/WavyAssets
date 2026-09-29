import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AdminRole } from '../constants/roles.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const admin = request.admin || request.user;

    if (!admin || !admin.role) {
      throw new ForbiddenException('Institutional role undetermined');
    }

    // SUPER_ADMIN has supreme Supreme clearance across all operational domains
    if (admin.role === AdminRole.SUPER_ADMIN || admin.role === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(admin.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient institutional privileges. Required: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
