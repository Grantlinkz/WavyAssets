import { describe, it, expect } from 'vitest';
import {
  maskEmail,
  redactSensitiveData,
} from '@/common/interceptors/pii-redaction.interceptor';

describe('PII Redaction & Security Masking Utilities', () => {
  describe('maskEmail', () => {
    it('should mask email prefix retaining only first and last characters', () => {
      expect(maskEmail('allocator@zurich-familyoffice.ch')).toBe('a***r@zurich-familyoffice.ch');
      expect(maskEmail('john.doe@sovereign-vault.com')).toBe('j***e@sovereign-vault.com');
    });

    it('should safely handle short local parts or invalid inputs', () => {
      expect(maskEmail('a@wavyassets.com')).toBe('*@wavyassets.com');
      expect(maskEmail('invalid-string')).toBe('[REDACTED]');
    });
  });

  describe('redactSensitiveData', () => {
    it('should redact sensitive authentication keys (passwords, tokens, OTPs)', () => {
      const payload = {
        email: 'investor@firm.com',
        password: 'SuperSecretPassword123!',
        passphrase: 'UltraSecurePassphrase!',
        otpCode: '654321',
        token: 'eyJh...token',
        refreshToken: 'refresh_xyz',
        publicField: 'Institutional Tier',
      };

      const redacted = redactSensitiveData(payload) as Record<string, unknown>;

      expect(redacted.password).toBe('[REDACTED]');
      expect(redacted.passphrase).toBe('[REDACTED]');
      expect(redacted.otpCode).toBe('[REDACTED]');
      expect(redacted.token).toBe('[REDACTED]');
      expect(redacted.refreshToken).toBe('[REDACTED]');
      expect(redacted.email).toBe('i***r@firm.com');
      expect(redacted.publicField).toBe('Institutional Tier');
    });

    it('should redact sensitive PII (fullName, telegram, phone)', () => {
      const leadPayload = {
        fullName: 'Eleanor Vance',
        workEmail: 'vance@allocator.ch',
        telegram: '@eleanor_vault',
        companyName: 'Vance Capital SA',
      };

      const redacted = redactSensitiveData(leadPayload) as Record<string, unknown>;

      expect(redacted.fullName).toBe('[REDACTED_PII]');
      expect(redacted.workEmail).toBe('v***e@allocator.ch');
      expect(redacted.telegram).toBe('[REDACTED_PII]');
      expect(redacted.companyName).toBe('Vance Capital SA');
    });

    it('should recursively redact nested data structures and arrays', () => {
      const nestedPayload = {
        user: {
          fullName: 'Marcus Aurelius',
          credentials: {
            password: 'secretPassword',
            otp: '112233',
          },
        },
        inquiries: [
          { workEmail: 'client1@hedgefund.com', token: 'token1' },
          { workEmail: 'client2@hedgefund.com', token: 'token2' },
        ],
      };

      const redacted = redactSensitiveData(nestedPayload) as Record<string, any>;

      expect(redacted.user.fullName).toBe('[REDACTED_PII]');
      expect(redacted.user.credentials.password).toBe('[REDACTED]');
      expect(redacted.user.credentials.otp).toBe('[REDACTED]');
      expect(redacted.inquiries[0].workEmail).toBe('c***1@hedgefund.com');
      expect(redacted.inquiries[0].token).toBe('[REDACTED]');
      expect(redacted.inquiries[1].workEmail).toBe('c***2@hedgefund.com');
      expect(redacted.inquiries[1].token).toBe('[REDACTED]');
    });
  });
});
