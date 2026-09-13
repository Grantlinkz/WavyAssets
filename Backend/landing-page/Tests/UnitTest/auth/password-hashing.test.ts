import { describe, it, expect } from 'vitest';
import { CryptoService } from '@/common/utils/crypto.service';
import { ConfigService } from '@nestjs/config';

describe('Argon2id Password Hashing & Constant-Time Verification', () => {
  const mockConfigService = {
    get: (key: string) => {
      if (key === 'security.jwtSecret') return 'test_jwt_secret_64_bytes_long_string_for_testing_purposes!';
      if (key === 'security.fieldEncryptionKey') return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      return null;
    },
  } as ConfigService;

  const cryptoService = new CryptoService(mockConfigService);

  it('should hash password using memory-hard Argon2id parameters', async () => {
    const password = 'SovereignWealthPassphrase2026!';
    const hash = await cryptoService.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(hash).toContain('m=65536'); // 64 MB memory parameter
    expect(hash).toContain('t=3');     // 3 iterations
    expect(hash).toContain('p=4');     // 4 threads parallelism
  });

  it('should verify correct password successfully in constant time', async () => {
    const password = 'InstitutionalTierSecurityPassword#1';
    const hash = await cryptoService.hashPassword(password);

    const isValid = await cryptoService.verifyPassword(hash, password);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password in constant time', async () => {
    const password = 'CorrectPassphrase!';
    const hash = await cryptoService.hashPassword(password);

    const isValid = await cryptoService.verifyPassword(hash, 'IncorrectAttempt!');
    expect(isValid).toBe(false);
  });

  it('should gracefully handle malformed hash strings without throwing', async () => {
    const isValid = await cryptoService.verifyPassword('invalid_hash_string', 'password');
    expect(isValid).toBe(false);
  });
});
