import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface OtpEmailOptions {
  toEmail: string;
  otpCode: string;
  requesterIp?: string;
  userFullName?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resendClient: Resend | null = null;
  private readonly emailProvider: 'resend' | 'console';
  private readonly emailFrom: string;
  private readonly isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.emailProvider =
      this.configService.get<'resend' | 'console'>('email.provider') || 'resend';
    this.emailFrom =
      this.configService.get<string>('email.emailFrom') ||
      'WavyAssets Security <security@wavyassets.com>';
    this.isProduction =
      this.configService.get<string>('server.nodeEnv') === 'production';

    const apiKey = this.configService.get<string>('email.resendApiKey');
    if (apiKey && apiKey.startsWith('re_')) {
      this.resendClient = new Resend(apiKey);
    }
  }

  /**
   * Generates the Swiss-typography HTML email template for 2FA OTP verification.
   */
  private generateSwissOtpTemplate(otpCode: string, requesterIp = 'Unknown'): string {
    const timestampUtc = new Date().toUTCString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WavyAssets Authentication Challenge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #08090B; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #0D0F12; border: 1px solid #222632; border-radius: 8px; overflow: hidden; padding: 40px 32px;">
          <!-- Header / Brand -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1A1E26;">
              <span style="font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">WavyAssets</span>
              <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: rgba(0, 194, 136, 0.15); border: 1px solid #00C288; border-radius: 4px; font-size: 10px; font-weight: 600; color: #00C288; letter-spacing: 1px;">ENCLAVE VERIFIED</span>
            </td>
          </tr>
          
          <!-- Subject & Body -->
          <tr>
            <td style="padding-top: 32px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 12px 0;">Two-Step Verification Challenge</h1>
              <p style="font-size: 14px; line-height: 22px; color: #8C96A5; margin: 0 0 28px 0;">
                Use the authorization code below to complete your sign-in to the WavyAssets Institutional Terminal. This single-use challenge expires in <strong style="color: #FFFFFF;">5 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Monospace OTP Code Display -->
          <tr>
            <td align="center" style="padding: 24px 0;">
              <div style="background-color: #12151B; border: 1px solid #D4AF37; border-radius: 6px; padding: 20px; text-align: center;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #D4AF37;">${otpCode}</span>
              </div>
            </td>
          </tr>

          <!-- Security Metadata Ribbon -->
          <tr>
            <td style="padding: 24px 0; border-top: 1px solid #1A1E26; border-bottom: 1px solid #1A1E26;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #647082; line-height: 18px;">
                <tr>
                  <td style="padding: 3px 0;">Timestamp (UTC):</td>
                  <td align="right" style="color: #8C96A5;">${timestampUtc}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Requester Origin:</td>
                  <td align="right" style="color: #8C96A5;">${requesterIp}</td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Cryptographic Algorithm:</td>
                  <td align="right" style="color: #8C96A5;">Argon2id (Memory-Hard)</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security Warning -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="font-size: 11px; line-height: 16px; color: #505A69; margin: 0;">
                Security Notice: WavyAssets partners and representatives will never request this verification code via telephone, messaging apps, or direct email. If you did not initiate this request, immediately alert custody security.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Dispatches the 2FA OTP code via Resend or dev console fallback.
   */
  async sendOtpEmail(options: OtpEmailOptions): Promise<boolean> {
    const { toEmail, otpCode, requesterIp } = options;

    // Local Development Console Fallback
    if (!this.isProduction && (this.emailProvider === 'console' || !this.resendClient)) {
      this.logger.log(
        `[AUTH-DEV-OTP] Verification code for ${toEmail}: ${otpCode} (Expires in 5m, IP: ${requesterIp || 'local'})`,
      );
      return true;
    }

    if (!this.resendClient) {
      this.logger.warn(
        `Resend client not configured. Simulated dispatch of OTP to ${toEmail}`,
      );
      return false;
    }

    try {
      const html = this.generateSwissOtpTemplate(otpCode, requesterIp);

      const result = await this.resendClient.emails.send({
        from: this.emailFrom,
        to: toEmail,
        subject: `WavyAssets Security Challenge: ${otpCode}`,
        html,
      });

      if (result.error) {
        this.logger.error(`Resend API rejected email dispatch: ${result.error.message}`);
        return false;
      }

      this.logger.log(`Successfully dispatched transactional 2FA OTP via Resend to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error('Unexpected error while sending 2FA OTP email via Resend', error);
      return false;
    }
  }

  /**
   * Generates the Swiss-typography HTML email template for double opt-in research newsletter.
   */
  private generateNewsletterConfirmationTemplate(verificationLink: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WavyAssets Institutional Research Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #08090B; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #0D0F12; border: 1px solid #222632; border-radius: 8px; overflow: hidden; padding: 40px 32px;">
          <!-- Header / Brand -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1A1E26;">
              <span style="font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #D4AF37; text-transform: uppercase;">WavyAssets</span>
              <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background: rgba(0, 194, 136, 0.15); border: 1px solid #00C288; border-radius: 4px; font-size: 10px; font-weight: 600; color: #00C288; letter-spacing: 1px;">RESEARCH ENCLAVE</span>
            </td>
          </tr>
          
          <!-- Subject & Body -->
          <tr>
            <td style="padding-top: 32px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 12px 0;">Confirm Institutional Subscription</h1>
              <p style="font-size: 14px; line-height: 22px; color: #8C96A5; margin: 0 0 28px 0;">
                You have requested subscription to WavyAssets Macro & Sovereign Yield Intelligence. In accordance with SEC and FINMA transparency protocols, please confirm your double opt-in authorization below.
              </p>
            </td>
          </tr>

          <!-- Confirmation Button -->
          <tr>
            <td align="center" style="padding: 20px 0;">
              <a href="${verificationLink}" style="display: inline-block; background-color: #D4AF37; color: #08090B; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 6px; letter-spacing: 0.5px;">
                CONFIRM RESEARCH SUBSCRIPTION
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="padding-top: 16px;">
              <p style="font-size: 12px; line-height: 18px; color: #647082; word-break: break-all;">
                Or copy and paste this verification URL into your browser:<br/>
                <span style="color: #D4AF37;">${verificationLink}</span>
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #1A1E26;">
              <p style="font-size: 11px; line-height: 16px; color: #505A69; margin: 0;">
                If you did not request this research subscription, no further action is required. This link will safely expire in 48 hours.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Dispatches double opt-in confirmation email for newsletter subscriptions.
   */
  async sendNewsletterVerificationEmail(
    toEmail: string,
    verificationLink: string,
  ): Promise<boolean> {
    // Local Development Console Fallback
    if (!this.isProduction && (this.emailProvider === 'console' || !this.resendClient)) {
      this.logger.log(
        `[NEWSLETTER-DEV-LINK] Verification link for ${toEmail}: ${verificationLink}`,
      );
      return true;
    }

    if (!this.resendClient) {
      this.logger.warn(`Resend client not configured. Simulated newsletter link to ${toEmail}`);
      return false;
    }

    try {
      const html = this.generateNewsletterConfirmationTemplate(verificationLink);

      const result = await this.resendClient.emails.send({
        from: this.emailFrom,
        to: toEmail,
        subject: 'Confirm Your WavyAssets Research Subscription',
        html,
      });

      if (result.error) {
        this.logger.error(`Resend API rejected email dispatch: ${result.error.message}`);
        return false;
      }

      this.logger.log(`Successfully dispatched newsletter verification email to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error('Unexpected error while sending newsletter verification email', error);
      return false;
    }
  }
}

