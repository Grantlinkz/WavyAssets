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

    const url = request.url || '';

    // Allow emergency unfreeze and authentication operations
    const whitelistedPaths = [
      '/emergency/unfreeze',
      '/admin/emergency/unfreeze',
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/admin/auth/login',
      '/admin/auth/refresh',
      '/admin/auth/logout',
    ];

    const isWhitelisted = whitelistedPaths.some((path) => url.includes(path));
    if (isWhitelisted) {
      return true;
    }

    throw new ForbiddenException({
      errorCode: 'ERR_PLATFORM_EMERGENCY_FREEZE',
      message:
        'Platform is under emergency freeze. All mutating operations and settlements are suspended per FINMA Article 88.',
    });
  }
}
