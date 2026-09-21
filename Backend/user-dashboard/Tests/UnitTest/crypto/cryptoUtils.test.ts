import { describe, it, expect } from 'vitest';
import { CryptoUtils } from '../../../src/common/utils/crypto.utils';

describe('CryptoUtils', () => {
  const testSecret = 'wavy-test-secret-key-institutional-2026';
  const testKeyHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('generates deterministic  hashes', () => {
    const data = 'Global-handoff-ticket-test-data';
    const hash1 = CryptoUtils.hashHmacSha256(data, testSecret);
    const hash2 = CryptoUtils.hashHmacSha256(data, testSecret);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // 256 bits in hex
  });

  it('produces different hashes for different inputs or secrets', () => {
    const hash1 = CryptoUtils.hashHmacSha256('input1', testSecret);
    const hash2 = CryptoUtils.hashHmacSha256('input2', testSecret);
    const hash3 = CryptoUtils.hashHmacSha256('input1', 'different-secret');

    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('generates random hex strings of specified byte length', () => {
    const hex16 = CryptoUtils.generateRandomHex(16);
    const hex32 = CryptoUtils.generateRandomHex(32);

    expect(hex16).toHaveLength(32);
    expect(hex32).toHaveLength(64);
    expect(hex16).not.toBe(CryptoUtils.generateRandomHex(16));
  });

  it('performs constant-time string equality comparisons correctly', () => {
    expect(CryptoUtils.timingSafeEqual('Global-token', 'Global-token')).toBe(true);
    expect(CryptoUtils.timingSafeEqual('Global-token', 'different-token')).toBe(false);
    expect(CryptoUtils.timingSafeEqual('short', 'longer-string')).toBe(false);
  });

  it('encrypts and decrypts sensitive data symmetrically via AES-256-GCM', () => {
    const sensitiveData = 'VIP-Card-CVV-894-PIN-4491';
    const ciphertext = CryptoUtils.encryptAes256Gcm(sensitiveData, testKeyHex);

    expect(ciphertext).toContain(':');
    const parts = ciphertext.split(':');
    expect(parts).toHaveLength(3); // iv : authTag : encrypted

    const decrypted = CryptoUtils.decryptAes256Gcm(ciphertext, testKeyHex);
    expect(decrypted).toBe(sensitiveData);
  });

  it('fails decryption if ciphertext envelope is tampered with', () => {
    const sensitiveData = 'classified-institutional-data';
    const ciphertext = CryptoUtils.encryptAes256Gcm(sensitiveData, testKeyHex);
    const parts = ciphertext.split(':');

    // Corrupt the auth tag
    const tamperedCiphertext = `${parts[0]}:ffffffffffffffffffffffffffffffff:${parts[2]}`;

    expect(() => CryptoUtils.decryptAes256Gcm(tamperedCiphertext, testKeyHex)).toThrow();
  });

  it('throws BadRequestException if ciphertext envelope is malformed (not 3 colon-separated parts)', () => {
    expect(() => CryptoUtils.decryptAes256Gcm('not-a-valid-envelope', testKeyHex)).toThrow(
      'Malformed AES-256-GCM ciphertext envelope',
    );
    expect(() => CryptoUtils.decryptAes256Gcm('only:twoparts', testKeyHex)).toThrow(
      'Malformed AES-256-GCM ciphertext envelope',
    );
  });
});
