import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TelegramEnclaveAlertOptions {
  email: string;
  otpCode: string;
  tier: string;
  requesterIp?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly enabled: boolean;
  private readonly botToken: string;
  private readonly chatId: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled =
      this.configService.get<boolean>('telegram.enclaveEnabled') || false;
    this.botToken =
      this.configService.get<string>('telegram.enclaveBotToken') || '';
    this.chatId = this.configService.get<string>('telegram.enclaveChatId') || '';
  }

  /**
   * Dispatches an encrypted Enclave 2FA alert via Telegram Bot API for institutional accounts.
   */
  async sendEnclaveOtpAlert(options: TelegramEnclaveAlertOptions): Promise<boolean> {
    if (!this.enabled || !this.botToken || !this.chatId) {
      return false;
    }

    const { email, otpCode, tier, requesterIp } = options;
    const maskedEmail = email.replace(/^(.{2})(.*)(@.*)$/, '$1***$3');

    const message = `
🔒 *WAVYASSETS ENCLAVE SECURITY DISPATCH*
━━━━━━━━━━━━━━━━━━━━━━━━
*Tier:* ${tier}
*Target Account:* \`${maskedEmail}\`
*Verification Challenge:* \`${otpCode}\`
*Expiry:* 5 Minutes (Sliding TTL)
*Origin:* \`${requesterIp || 'Unknown'}\`
*Timestamp (UTC):* ${new Date().toUTCString()}
━━━━━━━━━━━━━━━━━━━━━━━━
_Zero-Trust Hardware Enclave Alert (Node Geneva-01)_
    `.trim();

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`Telegram Enclave API dispatch returned error: ${errText}`);
        return false;
      }

      this.logger.log(`Enclave 2FA OTP alert successfully dispatched to Telegram for ${maskedEmail}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to dispatch Telegram Enclave OTP alert', error);
      return false;
    }
  }

  /**
   * Dispatches a broadcast alert message (e.g. priority mandate alerts) to the Telegram Enclave channel.
   */
  async sendSecurityAlert(message: string): Promise<boolean> {
    if (!this.enabled || !this.botToken || !this.chatId) {
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`Telegram alert dispatch returned error: ${errText}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to dispatch alert message to Telegram Enclave', error);
      return false;
    }
  }
}

