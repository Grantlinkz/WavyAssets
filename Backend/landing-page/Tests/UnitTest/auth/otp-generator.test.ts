import { describe, it, expect } from 'vitest';
import { CryptoService } from '@/common/utils/crypto.service';
import { ConfigService } from '@nestjs/config';

describe('Cryptographic OTP Generation & Bearer Token Hashing', () => {
  const mockConfigService = {
    get: (key: string) => {
      if (key === 'security.jwtSecret') return 'test_hmac_secret_key_64_bytes_long_string_for_testing!';
      return null;
    },
  } as ConfigService;

  const cryptoService = new CryptoService(mockConfigService);

  it('should generate cryptographically random 6-digit numeric OTP', () => {
    const otp = cryptoService.generateOtp();

    expect(otp).toBeDefined();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);

    const numericVal = parseInt(otp, 10);
    expect(numericVal).toBeGreaterThanOrEqual(100000);
    expect(numericVal).toBeLessThan(1000000);
  });

  it('should maintain strict 6-digit format and high entropy across 500 random samples', () => {
    const generatedCodes = new Set<string>();

    for (let i = 0; i < 500; i++) {
      const code = cryptoService.generateOtp();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
      generatedCodes.add(code);
    }

    // High entropy check: 500 samples must generate at least 480 distinct OTP codes
    expect(generatedCodes.size).toBeGreaterThan(480);
  });

  it('should successfully hash and verify OTP codes using Argon2id', async () => {
    const otp = '849201';
    const hashedOtp = await cryptoService.hashOtp(otp);

    expect(hashedOtp).toBeDefined();
    expect(hashedOtp.startsWith('$argon2id$')).toBe(true);

    const isMatch = await cryptoService.verifyOtp(hashedOtp, otp);
    expect(isMatch).toBe(true);

    const isWrongMatch = await cryptoService.verifyOtp(hashedOtp, '123456');
    expect(isWrongMatch).toBe(false);
  });

  it('should compute deterministic HMAC-SHA256 hash for bearer tokens', () => {
    const token = 'wavy_ticket_99a88b77c66d21e8';
    const hash1 = cryptoService.hashToken(token);
    const hash2 = cryptoService.hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(token);

    const differentToken = 'wavy_ticket_11b22c33d44e55f6';
    expect(cryptoService.hashToken(differentToken)).not.toBe(hash1);
  });
});
