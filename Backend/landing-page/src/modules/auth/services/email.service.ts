import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface OtpEmailOptions {
  toEmail: string;
  otpCode: string;
  requesterIp?: string;
  userFullName?: string | null;
}

export interface ContactConfirmationEmailOptions {
  toEmail: string;
  fullName: string;
  companyName: string;
  service: string;
  allocationRange: string;
  inquiryId: string;
  telegram?: string;
  websiteUrl?: string;
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
    const rawFrom =
      this.configService.get<string>('email.emailFrom') ||
      'WavyAssets Security <security@wavyassets.com>';

    if (!rawFrom.includes('@')) {
      const sanitizedName = rawFrom.replace(/["']/g, '').trim();
      this.emailFrom = `${sanitizedName} <onboarding@resend.dev>`;
      this.logger.warn(
        `[Resend Config] EMAIL_FROM "${rawFrom}" is missing an email address! Falling back to "${this.emailFrom}". Format must be "Friendly Name <user@domain.com>".`,
      );
    } else {
      this.emailFrom = rawFrom.replace(/["']/g, '').trim();
    }

    this.isProduction =
      this.configService.get<string>('server.nodeEnv') === 'production';

    const apiKey = this.configService.get<string>('email.resendApiKey');
    if (apiKey && apiKey.startsWith('re_')) {
      this.resendClient = new Resend(apiKey);
    } else {
      this.logger.warn('[Resend Config] Invalid or missing RESEND_API_KEY. It must begin with "re_".');
    }
  }

  /**
   * Helper to format human-readable service titles for institutional communications.
   */
  private formatServiceLabel(service: string): string {
    const mapping: Record<string, string> = {
      CRYPTO: 'Crypto Yield Aggregation',
      STOCKS: 'Global Stocks DMA & Equities',
      AI_FUNDS: 'AI Systematic Quant Funds',
      REAL_ESTATE: 'Tokenized Prime Real Estate',
      VIP_CARDS: 'VIP Metal Card Program',
      WALLET: 'Institutional Custody & MPC Vault',
    };
    return mapping[service] || service;
  }

  /**
   * Generates the brand header HTML with exact squircle favicon + brand typography + secured badge.
   * Matches the visual design system and favicon exactly.
   */
  private generateBrandHeader(badgeText?: string): string {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="vertical-align: middle; margin-bottom: 24px;">
        <tr>
          <td style="vertical-align: middle; padding-right: 12px; width: 36px;">
            <!-- Exact Favicon / Squircle Logo -->
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 36px; height: 36px;">
              <rect width="64" height="64" rx="14" fill="#08090B"/>
              <rect x="1" y="1" width="62" height="62" rx="13" stroke="#D4AF37" stroke-width="2.5" stroke-opacity="0.8"/>
              <circle cx="32" cy="32" r="18" fill="#D4AF37" fill-opacity="0.15"/>
              <path d="M 12 33 C 18 19, 26 19, 32 33 C 38 47, 46 47, 52 33" stroke="#D4AF37" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M 12 42 C 18 28, 26 28, 32 42 C 38 56, 46 56, 52 42" stroke="#00C288" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.95"/>
              <circle cx="32" cy="17" r="3.2" fill="#D4AF37"/>
            </svg>
          </td>
          <td style="vertical-align: middle; white-space: nowrap;">
            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 2.2px; color: #FFFFFF; vertical-align: middle;">WAVY</span><span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; letter-spacing: 2.2px; color: #D4AF37; vertical-align: middle;">ASSETS</span><sup style="font-family: 'SF Mono', Monaco, 'Courier New', Courier, monospace; font-size: 8px; font-weight: 700; letter-spacing: 1px; color: #00C288; margin-left: 6px; vertical-align: baseline;">&#9679; SECURED</sup>
            ${badgeText ? `
              <span style="display: inline-block; margin-left: 12px; padding: 2px 7px; background: rgba(0, 194, 136, 0.12); border: 1px solid #00C288; border-radius: 4px; font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 9px; font-weight: 600; color: #00C288; letter-spacing: 1px; vertical-align: middle;">${badgeText}</span>
            ` : ''}
          </td>
        </tr>
      </table>
    `.trim();
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
          <!-- Header / Brand with Exact Squircle Favicon & Typography -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1A1E26;">
              ${this.generateBrandHeader('ENCLAVE VERIFIED')}
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
        this.logger.error(`[Resend Error] Failed to dispatch OTP to ${toEmail} from "${this.emailFrom}": [${result.error.name}] ${result.error.message}`);
        this.logger.error(`[Resend Diagnostic] 1. Ensure EMAIL_FROM has the format "Name <user@domain.com>".`);
        this.logger.error(`[Resend Diagnostic] 2. If using unverified domain, Resend requires sender to be "onboarding@resend.dev" and only delivers to your Resend account email.`);
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
   * Generates the Swiss-typography HTML email template for Password Reset challenge.
   */
  private generateSwissPasswordResetTemplate(otpCode: string, requesterIp = 'Unknown'): string {
    const timestampUtc = new Date().toUTCString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WavyAssets Password Reset Challenge</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #08090B; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #0D0F12; border: 1px solid #222632; border-radius: 8px; overflow: hidden; padding: 40px 32px;">
          <!-- Header / Brand -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1A1E26;">
              ${this.generateBrandHeader('PASSWORD RESET')}
            </td>
          </tr>
          
          <!-- Subject & Body -->
          <tr>
            <td style="padding-top: 32px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 0 0 12px 0;">Password Reset Authorization</h1>
              <p style="font-size: 14px; line-height: 22px; color: #8C96A5; margin: 0 0 28px 0;">
                A password reset was requested for your WavyAssets account. Use the 6-digit authorization code below to verify your identity and set a new password. This challenge expires in <strong style="color: #FFFFFF;">5 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Monospace OTP Code Display -->
          <tr>
            <td align="center" style="padding: 24px 0;">
              <div style="background-color: #12151B; border: 1px solid #A6FF00; border-radius: 6px; padding: 20px; text-align: center;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #A6FF00;">${otpCode}</span>
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
                Security Notice: If you did not request a password reset, please ignore this email or notify custody security immediately. Your account remains secured with your existing password.
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
   * Dispatches the Password Reset OTP challenge via Resend or dev console fallback.
   */
  async sendPasswordResetOtpEmail(options: OtpEmailOptions): Promise<boolean> {
    const { toEmail, otpCode, requesterIp } = options;

    // Local Development Console Fallback
    if (!this.isProduction && (this.emailProvider === 'console' || !this.resendClient)) {
      this.logger.log(
        `[AUTH-DEV-RESET-OTP] Password reset verification code for ${toEmail}: ${otpCode} (Expires in 5m, IP: ${requesterIp || 'local'})`,
      );
      return true;
    }

    if (!this.resendClient) {
      this.logger.warn(
        `Resend client not configured. Simulated dispatch of reset OTP to ${toEmail}`,
      );
      return false;
    }

    try {
      const html = this.generateSwissPasswordResetTemplate(otpCode, requesterIp);

      const result = await this.resendClient.emails.send({
        from: this.emailFrom,
        to: toEmail,
        subject: `WavyAssets Password Reset Challenge: ${otpCode}`,
        html,
      });

      if (result.error) {
        this.logger.error(`[Resend Error] Failed to dispatch reset OTP to ${toEmail}: [${result.error.name}] ${result.error.message}`);
        return false;
      }

      this.logger.log(`Successfully dispatched password reset OTP via Resend to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error('Unexpected error while sending password reset OTP email via Resend', error);
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
          <!-- Header / Brand with Exact Squircle Favicon & Typography -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1A1E26;">
              ${this.generateBrandHeader('RESEARCH ENCLAVE')}
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
   * Generates the Swiss-typography HTML email template for contact form inquiries.
   * Prominently conveys "We received your message and we will get back to you"
   * with effortless readability, institutional styling, and submitted parameters summary.
   */
  private generateContactConfirmationTemplate(
    options: ContactConfirmationEmailOptions,
  ): string {
    const timestampUtc = new Date().toUTCString();
    const serviceLabel = this.formatServiceLabel(options.service);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Received Your Message | WavyAssets</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #08090B; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #0D0F12; border: 1px solid #222632; border-radius: 8px; overflow: hidden; padding: 40px 32px;">
          <!-- Header / Brand with Exact Squircle Favicon & Typography -->
          <tr>
            <td align="left" style="padding-bottom: 24px; border-bottom: 1px solid #1A1E26;">
              ${this.generateBrandHeader('INQUIRY CONFIRMED')}
            </td>
          </tr>
          
          <!-- Subject & Primary Reassurance Box -->
          <tr>
            <td style="padding-top: 32px;">
              <div style="background-color: #12151B; border-left: 4px solid #00C288; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                <h1 style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 8px 0; letter-spacing: 0.3px;">
                  We received your message and we will get back to you
                </h1>
                <p style="font-size: 13px; line-height: 22px; color: #9AA8BA; margin: 0;">
                  Thank you for reaching out to WavyAssets, <strong style="color: #FFFFFF;">${options.fullName}</strong>. Your mandate inquiry has been securely ingested into our custody and allocations desk. An institutional relationship director will review your requirements and get back to you shortly (typically within 2 business hours).
                </p>
              </div>
            </td>
          </tr>

          <!-- Easy-to-Read Inquiry Summary -->
          <tr>
            <td>
              <div style="background-color: #0B0D10; border: 1px solid #1E232F; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #D4AF37; text-transform: uppercase; margin-bottom: 16px;">
                  MANDATE INQUIRY SUMMARY
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 22px;">
                  <tr>
                    <td style="padding: 5px 0; color: #647082; width: 42%;">Reference ID:</td>
                    <td align="right" style="color: #FFFFFF; font-family: 'SF Mono', Monaco, 'Courier New', monospace; font-size: 12px;">#${options.inquiryId.slice(0, 12)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #647082;">Authorized Contact:</td>
                    <td align="right" style="color: #FFFFFF; font-weight: 600;">${options.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #647082;">Entity / Organization:</td>
                    <td align="right" style="color: #FFFFFF;">${options.companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #647082;">Mandate Focus:</td>
                    <td align="right" style="color: #00C288; font-weight: 600;">${serviceLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #647082;">Target Allocation:</td>
                    <td align="right" style="color: #D4AF37; font-weight: 600;">${options.allocationRange}</td>
                  </tr>
                  ${options.telegram ? `
                  <tr>
                    <td style="padding: 5px 0; color: #647082;">Telegram Contact:</td>
                    <td align="right" style="color: #FFFFFF;">${options.telegram}</td>
                  </tr>
                  ` : ''}
                  ${options.websiteUrl ? `
                  <tr>
                    <td style="padding: 5px 0; color: #647082;">Website:</td>
                    <td align="right" style="color: #8C96A5;">${options.websiteUrl}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>

          <!-- What Happens Next (Numbered Steps for Effortless Readability) -->
          <tr>
            <td>
              <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #FFFFFF; text-transform: uppercase; margin-bottom: 12px;">
                  WHAT HAPPENS NEXT
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #8C96A5; line-height: 20px;">
                  <tr>
                    <td style="vertical-align: top; padding: 6px 12px 6px 0; color: #D4AF37; font-weight: 700; width: 22px;">01</td>
                    <td style="padding: 6px 0;"><strong style="color: #FFFFFF;">Desk Assessment:</strong> Our allocations committee reviews your mandate scope, liquidity profile, and compliance eligibility.</td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; padding: 6px 12px 6px 0; color: #D4AF37; font-weight: 700; width: 22px;">02</td>
                    <td style="padding: 6px 0;"><strong style="color: #FFFFFF;">Direct Desk Outreach:</strong> An assigned relationship director will contact you directly via <strong style="color: #FFFFFF;">${options.toEmail}</strong>${options.telegram ? ` or Telegram (<strong style="color: #FFFFFF;">${options.telegram}</strong>)` : ''}.</td>
                  </tr>
                  <tr>
                    <td style="vertical-align: top; padding: 6px 12px 6px 0; color: #D4AF37; font-weight: 700; width: 22px;">03</td>
                    <td style="padding: 6px 0;"><strong style="color: #FFFFFF;">Institutional Term Sheet:</strong> Qualified partners receive confidential term sheets, fee structures, and multi-signature onboarding access.</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Direct Reply Callout -->
          <tr>
            <td style="padding: 16px 0; border-top: 1px solid #1A1E26; border-bottom: 1px solid #1A1E26;">
              <p style="font-size: 12px; line-height: 18px; color: #8C96A5; margin: 0;">
                <strong style="color: #FFFFFF;">Need immediate assistance?</strong> If you have pitch materials, NDAs, or confidential RFP documents to submit ahead of time, simply reply directly to this email or reach our desk at <a href="mailto:mandates@wavyassets.com" style="color: #D4AF37; text-decoration: none;">mandates@wavyassets.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer Metadata -->
          <tr>
            <td style="padding-top: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 11px; color: #505A69; line-height: 16px;">
                <tr>
                  <td>Timestamp (UTC): ${timestampUtc}</td>
                  <td align="right">Status: Queued for Desk Review</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 8px;">
                    Confidentiality Notice: This transmission contains proprietary information intended solely for the recipient. If you received this in error, notify compliance@wavyassets.com immediately.
                  </td>
                </tr>
              </table>
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
   * Dispatches automated response email to the user confirming receipt of their mandate inquiry.
   */
  async sendContactConfirmationEmail(
    options: ContactConfirmationEmailOptions,
  ): Promise<boolean> {
    const { toEmail, fullName, inquiryId } = options;

    // Local Development Console Fallback
    if (!this.isProduction && (this.emailProvider === 'console' || !this.resendClient)) {
      this.logger.log(
        `[CONTACT-DEV-RESPONSE] Mandate confirmation dispatched to ${toEmail} for ${fullName} [ID: ${inquiryId}] - "We received your message and we will get back to you."`,
      );
      return true;
    }

    if (!this.resendClient) {
      this.logger.warn(`Resend client not configured. Simulated contact confirmation to ${toEmail}`);
      return false;
    }

    try {
      const html = this.generateContactConfirmationTemplate(options);

      const result = await this.resendClient.emails.send({
        from: this.emailFrom,
        to: toEmail,
        subject: `We Received Your Message - WavyAssets Mandate Inquiry [#${inquiryId.slice(0, 8)}]`,
        html,
      });

      if (result.error) {
        this.logger.error(`Resend API rejected contact confirmation dispatch: ${result.error.message}`);
        return false;
      }

      this.logger.log(`Successfully dispatched contact confirmation email via Resend to ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error('Unexpected error while sending contact confirmation email', error);
      return false;
    }
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

