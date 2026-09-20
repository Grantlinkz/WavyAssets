export interface ServerConfig {
  port: number;
  nodeEnv: string;
  appUrl: string;
  clientUrl: string;
  dashboardUrl: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiration: string;
  refreshTokenSecret: string;
  refreshTokenExpiration: string;
  handoffTicketSecret: string;
  fieldEncryptionKey: string;
  throttleTtl: number;
  throttleLimit: number;
  authThrottleLimit: number;
}

export interface EmailConfig {
  provider: 'resend' | 'console';
  resendApiKey: string;
  emailFrom: string;
}

export interface TelegramConfig {
  enclaveEnabled: boolean;
  enclaveBotToken: string;
  enclaveChatId: string;
}

export interface SandboxConfig {
  devStaticOtp: string | null;
  devConsoleOtpFallback: boolean;
}

export interface AppConfiguration {
  server: ServerConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  email: EmailConfig;
  telegram: TelegramConfig;
  sandbox: SandboxConfig;
}

export default (): AppConfiguration => {
  const handoffTicketSecret = process.env.HANDOFF_TICKET_SECRET;
  if (!handoffTicketSecret || handoffTicketSecret.trim().length === 0) {
    throw new Error('HANDOFF_TICKET_SECRET configuration is required and cannot be empty.');
  }

  return {
    server: {
      port: parseInt(process.env.PORT || '4000', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      appUrl: process.env.APP_URL || 'http://localhost:4000',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:5174',
    },
    database: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wavyassets?schema=public',
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'wavy_sovereign_terminal_jwt_secret_dev_key_must_be_rotated_in_prod',
      jwtExpiration: process.env.JWT_EXPIRATION || '15m',
      refreshTokenSecret:
        process.env.REFRESH_TOKEN_SECRET || 'wavy_sovereign_refresh_secret_dev_key_must_be_rotated',
      refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
      handoffTicketSecret,
      fieldEncryptionKey:
        process.env.FIELD_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
      throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '120', 10),
      authThrottleLimit: parseInt(process.env.AUTH_THROTTLE_LIMIT || '5', 10),
    },
    email: {
      provider: (process.env.EMAIL_PROVIDER as 'resend' | 'console') || 'resend',
      resendApiKey: process.env.RESEND_API_KEY || '',
      emailFrom: process.env.EMAIL_FROM || 'WavyAssets Security <security@wavyassets.com>',
    },
    telegram: {
      enclaveEnabled: process.env.TELEGRAM_ENCLAVE_ENABLED === 'true',
      enclaveBotToken: process.env.TELEGRAM_ENCLAVE_BOT_TOKEN || '',
      enclaveChatId: process.env.TELEGRAM_ENCLAVE_CHAT_ID || '',
    },
    sandbox: {
      devStaticOtp: process.env.NODE_ENV === 'production' ? null : process.env.DEV_STATIC_OTP || null,
      devConsoleOtpFallback:
        process.env.NODE_ENV === 'production' ? false : process.env.DEV_CONSOLE_OTP_FALLBACK === 'true',
    },
  };
};
