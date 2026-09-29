import { describe, it, expect, beforeEach } from 'vitest';
import { TotpService } from '../../src/common/services/totp.service';

describe('TotpService', () => {
  let service: TotpService;

  beforeEach(() => {
    service = new TotpService();
  });

  describe('Secret Generation', () => {
    it('should generate a valid Base32 secret string', () => {
      const secret = service.generateSecret(32);
      expect(secret).toBeDefined();
      expect(secret.length).toBe(32);
      expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
    });
  });

  describe('TOTP Generation & Verification (RFC 6238)', () => {
    it('should generate a 6-digit TOTP code and verify it successfully', () => {
      const secret = service.generateSecret(32);
      const code = service.generateTotp(secret);

      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);

      const isValid = service.verifyTotp(code, secret);
      expect(isValid).toBe(true);
    });

    it('should verify codes within acceptable time windows', () => {
      const secret = service.generateSecret(32);
      // Generate code 1 step in the past
      const pastCode = service.generateTotp(secret, -1);

      expect(service.verifyTotp(pastCode, secret, 1)).toBe(true);
      expect(service.verifyTotp(pastCode, secret, 0)).toBe(false);
    });

    it('should reject invalid or incorrect TOTP codes', () => {
      const secret = service.generateSecret(32);
      expect(service.verifyTotp('000000', secret)).toBe(false);
      expect(service.verifyTotp('12345', secret)).toBe(false);
      expect(service.verifyTotp('', secret)).toBe(false);
    });
  });
});
