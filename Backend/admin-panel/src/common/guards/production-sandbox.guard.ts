import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class ProductionSandboxGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const isSandboxRequest =
      request.headers['x-sandbox-mode'] === 'true' ||
      request.body?.isSandbox === true ||
      request.query?.sandbox === 'true';

    if (isSandboxRequest) {
      throw new ForbiddenException(
        'Sandbox execution is strictly prohibited within the sovereign production enclave.',
      );
    }

    return true;
  }
}
