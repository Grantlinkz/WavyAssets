import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TransactionEmailOptions {
  toEmail: string;
  userFullName?: string | null;
  transactionType: string;
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  accountType?: string;
  newBalance?: number;
  timestamp?: Date;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;
  private readonly emailFrom: string;
  private readonly provider: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('RESEND_API_KEY') ||
      process.env.RESEND_API_KEY ||
      '';

    const rawFrom =
      this.configService.get<string>('EMAIL_FROM') ||
      process.env.EMAIL_FROM ||
      'WavyAssets Treasury <onboarding@resend.dev>';

    this.emailFrom = rawFrom.includes('@')
      ? rawFrom.trim()
      : 'WavyAssets Treasury <onboarding@resend.dev>';

    this.provider =
      this.configService.get<string>('EMAIL_PROVIDER') ||
      process.env.EMAIL_PROVIDER ||
      'resend';
  }

  /**
   * Dispatches an institutional transaction advice email to the client
   * for any ledger debit or credit modifying account balance.
   */
  async sendTransactionNotification(options: TransactionEmailOptions): Promise<boolean> {
    const {
      toEmail,
      userFullName,
      transactionType,
      direction,
      amount,
      currency,
      description,
      referenceId,
      accountType,
      newBalance,
      timestamp = new Date(),
    } = options;

    const formattedAmount = `${direction === 'CREDIT' ? '+' : '-'}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;

    const formattedBalance =
      newBalance !== undefined
        ? `${newBalance.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} ${currency}`
        : 'Available in Terminal';

    const badgeColor = direction === 'CREDIT' ? '#00C288' : '#D4AF37';
    const badgeBg = direction === 'CREDIT' ? 'rgba(0, 194, 136, 0.12)' : 'rgba(212, 175, 55, 0.12)';
    const badgeLabel = direction === 'CREDIT' ? 'LEDGER CREDIT NOTIFICATION' : 'LEDGER DEBIT NOTIFICATION';

    const subject = `[WavyAssets Advice] ${direction === 'CREDIT' ? 'Credit' : 'Debit'} of ${formattedAmount} — Ref: ${referenceId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #08090B; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #101216; border: 1px solid #23272F; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td height="3" style="background: linear-gradient(90deg, #D4AF37 0%, #00C288 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #1C2027;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #FFFFFF;">WAVY</span><span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #D4AF37;">ASSETS</span>
                    <span style="font-family: monospace; font-size: 9px; color: #00C288; font-weight: 700; margin-left: 8px; letter-spacing: 1px;">● INSTITUTIONAL ENCLAVE</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 700; color: ${badgeColor}; background-color: ${badgeBg}; border: 1px solid ${badgeColor}; letter-spacing: 0.5px;">
                      ${badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amount Banner -->
          <tr>
            <td style="padding: 28px 32px; background-color: #14171E; border-bottom: 1px solid #1C2027; text-align: center;">
              <span style="font-size: 11px; font-family: monospace; color: #8A92A6; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                Transaction Value (${direction})
              </span>
              <div style="font-size: 32px; font-weight: 800; font-family: 'SF Mono', Consolas, monospace; color: ${direction === 'CREDIT' ? '#00C288' : '#FFFFFF'}; letter-spacing: -0.5px;">
                ${formattedAmount}
              </div>
              <span style="display: inline-block; font-size: 12px; color: #8A92A6; margin-top: 6px;">
                Account Type: <strong style="color: #FFFFFF;">${accountType || 'AVAILABLE_CASH'}</strong>
              </span>
            </td>
          </tr>

          <!-- Content Details -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="font-size: 14px; line-height: 22px; color: #CBD2E0; margin-top: 0; margin-bottom: 20px;">
                Dear <strong style="color: #FFFFFF;">${userFullName || 'Valued Client'}</strong>,<br>
                This electronic advice confirms that a double-entry ledger settlement has altered your liquid custody account balance.
              </p>

              <!-- Detailed Field Matrix -->
              <table width="100%" cellpadding="10" cellspacing="0" border="0" style="background-color: #0A0C0E; border: 1px solid #23272F; border-radius: 4px; font-size: 12px;">
                <tr style="border-bottom: 1px solid #1C2027;">
                  <td width="38%" style="color: #8A92A6; font-family: monospace; text-transform: uppercase; font-size: 11px;">Description</td>
                  <td style="color: #FFFFFF; font-weight: 600;">${description}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1C2027;">
                  <td style="color: #8A92A6; font-family: monospace; text-transform: uppercase; font-size: 11px;">Transaction Type</td>
                  <td style="color: #D4AF37; font-family: monospace; font-weight: 700;">${transactionType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1C2027;">
                  <td style="color: #8A92A6; font-family: monospace; text-transform: uppercase; font-size: 11px;">Audit Reference</td>
                  <td style="color: #FFFFFF; font-family: monospace;">${referenceId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #1C2027;">
                  <td style="color: #8A92A6; font-family: monospace; text-transform: uppercase; font-size: 11px;">Settlement Date</td>
                  <td style="color: #FFFFFF; font-family: monospace;">${timestamp.toUTCString()}</td>
                </tr>
                <tr>
                  <td style="color: #8A92A6; font-family: monospace; text-transform: uppercase; font-size: 11px;">New Account Balance</td>
                  <td style="color: #00C288; font-family: monospace; font-weight: 700;">${formattedBalance}</td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="margin-top: 24px; padding: 14px 16px; background-color: rgba(212, 175, 55, 0.08); border-left: 3px solid #D4AF37; border-radius: 2px;">
                <span style="font-size: 11px; line-height: 18px; color: #D4AF37; display: block;">
                  <strong>Automated Security Protocol:</strong> If you did not initiate or expect this balance change, please invoke your terminal killswitch or contact your Treasury Officer at <a href="mailto:support@wavyassets.com" style="color: #D4AF37; text-decoration: underline;">support@wavyassets.com</a> immediately.
                </span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0B0D11; border-top: 1px solid #1C2027; text-align: center; font-size: 10px; color: #60687A; font-family: monospace;">
              WavyAssets Global Wealth AG • FINMA AMLA Article 14 Enclave • Geneva &amp; Zurich
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      this.logger.log(`Dispatching balance notification (${direction} ${formattedAmount}) to ${toEmail}`);

      if (!this.apiKey || !this.apiKey.startsWith('re_') || this.provider === 'console') {
        this.logger.log(`[Console Email Fallback] To: ${toEmail} | Subject: ${subject}`);
        return true;
      }

      // Native fetch to Resend API endpoint
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.emailFrom,
          to: [toEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`Resend API dispatch returned ${response.status}: ${errorText}`);
        return false;
      }

      const resData = (await response.json()) as Record<string, unknown>;
      this.logger.log(`Successfully dispatched transactional email via Resend (ID: ${resData?.id}) to ${toEmail}`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error sending transaction email notification: ${msg}`);
      return false;
    }
  }

  /**
   * Dispatches deposit status notification (PENDING, APPROVED, REJECTED)
   */
  async sendDepositNotification(options: {
    toEmail: string;
    userFullName?: string | null;
    amount: number;
    currency: string;
    referenceId: string;
    rail: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason?: string;
    newBalance?: number;
    timestamp?: Date;
  }): Promise<boolean> {
    const {
      toEmail,
      userFullName,
      amount,
      currency,
      referenceId,
      rail,
      status,
      reason,
      newBalance,
      timestamp = new Date(),
    } = options;

    const formattedAmount = `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;

    let badgeColor = '#D4AF37'; // Amber for PENDING
    let badgeBg = 'rgba(212, 175, 55, 0.12)';
    let badgeLabel = 'DEPOSIT PENDING TREASURY VERIFICATION';
    let headline = 'Deposit Inflow Registered';
    let explanation = `Your incoming deposit of ${formattedAmount} via ${rail} has been registered and is awaiting manual treasury receipt verification.`;

    if (status === 'APPROVED') {
      badgeColor = '#00C288';
      badgeBg = 'rgba(0, 194, 136, 0.12)';
      badgeLabel = 'DEPOSIT APPROVED & CREDITED';
      headline = 'Deposit Cleared & Allocated';
      explanation = `Your incoming deposit of +${formattedAmount} via ${rail} has been verified and credited to your Available Cash balance.`;
    } else if (status === 'REJECTED') {
      badgeColor = '#E5484D';
      badgeBg = 'rgba(229, 72, 77, 0.12)';
      badgeLabel = 'DEPOSIT REJECTED';
      headline = 'Deposit Verification Failed';
      explanation = `Your incoming deposit of ${formattedAmount} via ${rail} could not be verified by treasury operations.${
        reason ? ` Reason: ${reason}` : ''
      }`;
    }

    const subject = `[WavyAssets Treasury] Deposit ${status} (${formattedAmount}) — Ref: ${referenceId}`;

    const balanceRow =
      newBalance !== undefined && status === 'APPROVED'
        ? `<tr>
            <td style="padding: 10px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">UPDATED CASH BALANCE:</td>
            <td style="padding: 10px 0; color: #00C288; font-size: 13px; font-family: monospace; font-weight: bold; text-align: right;">${newBalance.toLocaleString(
              'en-US',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )} ${currency}</td>
          </tr>`
        : '';

    const reasonRow =
      reason && status === 'REJECTED'
        ? `<tr>
            <td style="padding: 10px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">AUDIT REASON:</td>
            <td style="padding: 10px 0; color: #E5484D; font-size: 13px; font-family: monospace; text-align: right;">${reason}</td>
          </tr>`
        : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #08090B; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #101216; border: 1px solid #23272F; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);">
          <tr>
            <td style="height: 4px; background-color: ${badgeColor};"></td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1C2027;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #FFFFFF; font-family: monospace;">WAVY<span style="color: #D4AF37;">ASSETS</span></span>
                    <div style="font-size: 10px; color: #60687A; letter-spacing: 1px; margin-top: 2px; font-family: monospace;">TREASURY &amp; SETTLEMENT ENCLAVE</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 8px; background-color: ${badgeBg}; border: 1px solid ${badgeColor}; border-radius: 3px; color: ${badgeColor}; font-size: 10px; font-weight: bold; font-family: monospace; letter-spacing: 0.5px;">
                      ${badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin-bottom: 8px;">
                ${headline}
              </div>
              <p style="font-size: 14px; line-height: 22px; color: #ADB8C8; margin: 0 0 24px 0;">
                Dear ${userFullName || 'Valued Client'},<br><br>
                ${explanation}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0B0D11; border: 1px solid #1E222A; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">AMOUNT:</td>
                  <td style="padding: 6px 0; color: #FFFFFF; font-size: 16px; font-weight: bold; font-family: monospace; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">SETTLEMENT RAIL:</td>
                  <td style="padding: 6px 0; color: #D4AF37; font-size: 13px; font-family: monospace; font-weight: 600; text-align: right;">${rail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">STATUS:</td>
                  <td style="padding: 6px 0; color: ${badgeColor}; font-size: 13px; font-family: monospace; font-weight: bold; text-align: right;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">REFERENCE ID:</td>
                  <td style="padding: 6px 0; color: #ADB8C8; font-size: 13px; font-family: monospace; text-align: right;">${referenceId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">TIMESTAMP:</td>
                  <td style="padding: 6px 0; color: #ADB8C8; font-size: 13px; font-family: monospace; text-align: right;">${timestamp.toUTCString()}</td>
                </tr>
                ${balanceRow}
                ${reasonRow}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0B0D11; border-top: 1px solid #1C2027; text-align: center; font-size: 10px; color: #60687A; font-family: monospace;">
              WavyAssets Global Wealth AG • FINMA AMLA Article 14 Enclave • Geneva &amp; Zurich
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.dispatchRawEmail(toEmail, subject, htmlContent);
  }

  /**
   * Dispatches withdrawal status notification (PENDING, APPROVED, REJECTED)
   */
  async sendWithdrawalNotification(options: {
    toEmail: string;
    userFullName?: string | null;
    amount: number;
    currency: string;
    referenceId: string;
    rail: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    destination?: string;
    reason?: string;
    newBalance?: number;
    timestamp?: Date;
  }): Promise<boolean> {
    const {
      toEmail,
      userFullName,
      amount,
      currency,
      referenceId,
      rail,
      status,
      destination,
      reason,
      newBalance,
      timestamp = new Date(),
    } = options;

    const formattedAmount = `${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;

    let badgeColor = '#D4AF37'; // Amber for PENDING
    let badgeBg = 'rgba(212, 175, 55, 0.12)';
    let badgeLabel = 'WITHDRAWAL PENDING CO-SIGNATURE';
    let headline = 'Withdrawal Request Queued';
    let explanation = `Your withdrawal request of ${formattedAmount} via ${rail} has been securely queued and is undergoing FINMA dual-officer co-signature review.`;

    if (status === 'APPROVED') {
      badgeColor = '#00C288';
      badgeBg = 'rgba(0, 194, 136, 0.12)';
      badgeLabel = 'WITHDRAWAL APPROVED & DISBURSED';
      headline = 'Withdrawal Authorization Complete';
      explanation = `Your withdrawal of -${formattedAmount} via ${rail} has received all required officer signatures and has been disbursed${
        destination ? ` to ${destination}` : ''
      }.`;
    } else if (status === 'REJECTED') {
      badgeColor = '#E5484D';
      badgeBg = 'rgba(229, 72, 77, 0.12)';
      badgeLabel = 'WITHDRAWAL DECLINED & REFUNDED';
      headline = 'Withdrawal Request Declined';
      explanation = `Your withdrawal request of ${formattedAmount} was declined during compliance review and the reserved capital has been refunded to your Available Cash balance.${
        reason ? ` Reason: ${reason}` : ''
      }`;
    }

    const subject = `[WavyAssets Treasury] Withdrawal ${status} (${formattedAmount}) — Ref: ${referenceId}`;

    const destRow = destination
      ? `<tr>
          <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">DESTINATION:</td>
          <td style="padding: 6px 0; color: #FFFFFF; font-size: 12px; font-family: monospace; text-align: right; word-break: break-all;">${destination}</td>
        </tr>`
      : '';

    const balanceRow =
      newBalance !== undefined
        ? `<tr>
            <td style="padding: 10px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">AVAILABLE BALANCE:</td>
            <td style="padding: 10px 0; color: #00C288; font-size: 13px; font-family: monospace; font-weight: bold; text-align: right;">${newBalance.toLocaleString(
              'en-US',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )} ${currency}</td>
          </tr>`
        : '';

    const reasonRow =
      reason && status === 'REJECTED'
        ? `<tr>
            <td style="padding: 10px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">AUDIT REASON:</td>
            <td style="padding: 10px 0; color: #E5484D; font-size: 13px; font-family: monospace; text-align: right;">${reason}</td>
          </tr>`
        : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #FFFFFF;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #08090B; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #101216; border: 1px solid #23272F; border-radius: 6px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);">
          <tr>
            <td style="height: 4px; background-color: ${badgeColor};"></td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1C2027;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 700; letter-spacing: 2px; color: #FFFFFF; font-family: monospace;">WAVY<span style="color: #D4AF37;">ASSETS</span></span>
                    <div style="font-size: 10px; color: #60687A; letter-spacing: 1px; margin-top: 2px; font-family: monospace;">TREASURY &amp; SETTLEMENT ENCLAVE</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 8px; background-color: ${badgeBg}; border: 1px solid ${badgeColor}; border-radius: 3px; color: ${badgeColor}; font-size: 10px; font-weight: bold; font-family: monospace; letter-spacing: 0.5px;">
                      ${badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <div style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin-bottom: 8px;">
                ${headline}
              </div>
              <p style="font-size: 14px; line-height: 22px; color: #ADB8C8; margin: 0 0 24px 0;">
                Dear ${userFullName || 'Valued Client'},<br><br>
                ${explanation}
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0B0D11; border: 1px solid #1E222A; border-radius: 4px; padding: 16px 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">DISBURSEMENT AMOUNT:</td>
                  <td style="padding: 6px 0; color: #FFFFFF; font-size: 16px; font-weight: bold; font-family: monospace; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">DISBURSEMENT RAIL:</td>
                  <td style="padding: 6px 0; color: #D4AF37; font-size: 13px; font-family: monospace; font-weight: 600; text-align: right;">${rail}</td>
                </tr>
                ${destRow}
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">STATUS:</td>
                  <td style="padding: 6px 0; color: ${badgeColor}; font-size: 13px; font-family: monospace; font-weight: bold; text-align: right;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">REFERENCE ID:</td>
                  <td style="padding: 6px 0; color: #ADB8C8; font-size: 13px; font-family: monospace; text-align: right;">${referenceId}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8F9CAE; font-size: 13px; font-family: monospace;">TIMESTAMP:</td>
                  <td style="padding: 6px 0; color: #ADB8C8; font-size: 13px; font-family: monospace; text-align: right;">${timestamp.toUTCString()}</td>
                </tr>
                ${balanceRow}
                ${reasonRow}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #0B0D11; border-top: 1px solid #1C2027; text-align: center; font-size: 10px; color: #60687A; font-family: monospace;">
              WavyAssets Global Wealth AG • FINMA AMLA Article 14 Enclave • Geneva &amp; Zurich
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    return this.dispatchRawEmail(toEmail, subject, htmlContent);
  }

  private async dispatchRawEmail(toEmail: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      this.logger.log(`Dispatching notification email ("${subject}") to ${toEmail}`);

      if (!this.apiKey || !this.apiKey.startsWith('re_') || this.provider === 'console') {
        this.logger.log(`[Console Email Fallback] To: ${toEmail} | Subject: ${subject}`);
        return true;
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.emailFrom,
          to: [toEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`Resend API returned ${response.status}: ${errorText}`);
        return false;
      }

      const resData = (await response.json()) as Record<string, unknown>;
      this.logger.log(`Successfully dispatched email via Resend (ID: ${resData?.id}) to ${toEmail}`);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error sending raw email: ${msg}`);
      return false;
    }
  }
}

