import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { EmergencyService } from '../../modules/emergency/emergency.service';

@Injectable()
export class EmergencyLockdownGuard implements CanActivate {
  constructor(private readonly emergencyService: EmergencyService) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.emergencyService.isPlatformFrozen()) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase();

    // Allow read requests (GET, HEAD, OPTIONS)
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const rawPath =
      (request.path || request.url?.split('?')[0] || '').replace(/\/+$/, '') || '/';

    // Allow emergency unfreeze and authentication operations
    const whitelistedExactPaths = new Set([
      '/emergency/unfreeze',
      '/admin/emergency/unfreeze',
      '/api/v1/emergency/unfreeze',
      '/api/v1/admin/emergency/unfreeze',
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/admin/auth/login',
      '/admin/auth/refresh',
      '/admin/auth/logout',
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
      '/api/v1/auth/logout',
      '/api/v1/admin/auth/login',
      '/api/v1/admin/auth/refresh',
      '/api/v1/admin/auth/logout',
    ]);

    if (whitelistedExactPaths.has(rawPath)) {
      return true;
    }

    throw new ForbiddenException({
      errorCode: 'ERR_PLATFORM_EMERGENCY_FREEZE',
      message:
        'Platform is under emergency freeze. All mutating operations and settlements are suspended per FINMA Article 88.',
    });
  }
}
