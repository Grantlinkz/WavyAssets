import { Logger } from '@nestjs/common';

export function validateEnvironment(config: Record<string, unknown>): Record<string, unknown> {
  const logger = new Logger('EnvironmentValidation');
  const nodeEnv = (config.NODE_ENV as string) || 'development';

  // Production Security Guard validation
  if (nodeEnv === 'production') {
    if (config.DEV_STATIC_OTP) {
      const errorMsg =
        'CRITICAL SECURITY HAZARD: DEV_STATIC_OTP must NOT be defined in production environment!';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (config.EMAIL_PROVIDER === 'console') {
      const errorMsg =
        'CRITICAL SECURITY HAZARD: EMAIL_PROVIDER=console is forbidden in production environment!';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!config.JWT_SECRET || (config.JWT_SECRET as string).includes('dev_key')) {
      logger.warn(
        'SECURITY WARNING: JWT_SECRET appears to use a development key in production mode!',
      );
    }

    if (!config.REFRESH_TOKEN_SECRET || (config.REFRESH_TOKEN_SECRET as string).includes('dev_key')) {
      logger.warn(
        'SECURITY WARNING: REFRESH_TOKEN_SECRET appears to use a development key in production mode!',
      );
    }

    if (!config.FIELD_ENCRYPTION_KEY || (config.FIELD_ENCRYPTION_KEY as string).length !== 64) {
      logger.warn(
        'SECURITY WARNING: FIELD_ENCRYPTION_KEY must be a 64-character hex string (256 bits)!',
      );
    }
  }

  return config;
}
