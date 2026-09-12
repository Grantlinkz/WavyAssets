import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../../../src/common/utils/crypto.service';

describe('CryptoService Blind Indexing & Encryption Utilities', () => {
  let cryptoService: CryptoService;

  beforeEach(() => {
    const configService = {
      get: (key: string) => {
        if (key === 'security.jwtSecret') {
          return 'test_hmac_secret_key_minimum_64_characters_length_required_for_testing_purposes!';
        }
        if (key === 'security.fieldEncryptionKey') {
          return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
        }
        return null;
      },
    } as unknown as ConfigService;

    cryptoService = new CryptoService(configService);
  });

  it('should generate deterministic blind index hashes for identical emails regardless of casing or whitespace', () => {
    const hash1 = cryptoService.hashBlindIndex('Allocator@Swiss-Vault.ch');
    const hash2 = cryptoService.hashBlindIndex('allocator@swiss-vault.ch');
    const hash3 = cryptoService.hashBlindIndex('  ALLOCATOR@swiss-vault.ch   ');

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it('should produce different blind index hashes for different email addresses', () => {
    const hashA = cryptoService.hashBlindIndex('allocatorA@swiss-vault.ch');
    const hashB = cryptoService.hashBlindIndex('allocatorB@swiss-vault.ch');

    expect(hashA).not.toBe(hashB);
  });

  it('should deterministically hash IP addresses for zero-raw-IP audit compliance', () => {
    const ipHash1 = cryptoService.hashIpAddress('192.168.1.100');
    const ipHash2 = cryptoService.hashIpAddress('192.168.1.100');
    const ipHash3 = cryptoService.hashIpAddress('10.0.0.1');

    expect(ipHash1).toBe(ipHash2);
    expect(ipHash1).not.toBe(ipHash3);
    expect(ipHash1).toHaveLength(64);
  });

  it('should encrypt and decrypt sensitive fields with AES-256-GCM integrity', () => {
    const secretPii = 'Alexander von Bern (+41 79 123 45 67)';
    const encrypted = cryptoService.encryptField(secretPii);

    expect(encrypted).not.toBe(secretPii);
    const parts = encrypted.split(':');
    expect(parts).toHaveLength(3); // iv : authTag : ciphertext

    const decrypted = cryptoService.decryptField(encrypted);
    expect(decrypted).toBe(secretPii);
  });
});
