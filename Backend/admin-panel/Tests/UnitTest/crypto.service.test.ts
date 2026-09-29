import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from '../../src/common/services/crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    process.env.FIELD_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    service = new CryptoService();
  });

  describe('Argon2 Password Hashing & Verification', () => {
    it('should hash a password and verify it successfully', async () => {
      const password = 'SupremeMasterKey2026!#';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$argon2id$')).toBe(true);

      const isValid = await service.verifyPassword(hash, password);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await service.hashPassword(password);

      const isValid = await service.verifyPassword(hash, 'WrongPassword456!');
      expect(isValid).toBe(false);
    });
  });

  describe('AES-256-GCM Field-Level Authenticated Encryption', () => {
    it('should encrypt and decrypt plaintext accurately', () => {
      const sensitiveData = 'eleanor.vance@geneva-Supreme.ch';
      const encrypted = service.encrypt(sensitiveData);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toEqual(sensitiveData);

      const parts = encrypted.split(':');
      expect(parts.length).toBe(3); // iv : authTag : ciphertext

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(sensitiveData);
    });

    it('should return empty string if input is empty', () => {
      expect(service.encrypt('')).toBe('');
      expect(service.decrypt('')).toBe('');
    });

    it('should return original string if input is not formatted as ciphertext', () => {
      const plain = 'regular-unencrypted-text';
      expect(service.decrypt(plain)).toBe(plain);
    });
  });

  describe('Blind Indexing (HMAC-SHA256)', () => {
    it('should generate deterministic blind index hashes', () => {
      const email1 = 'Client@WavyAssets.ch';
      const email2 = '   client@wavyassets.ch  ';

      const hash1 = service.hashBlindIndex(email1);
      const hash2 = service.hashBlindIndex(email2);

      expect(hash1).toBeDefined();
      expect(hash1).toHaveLength(64);
      expect(hash1).toEqual(hash2);
    });
  });

  describe('IP Hashing (SHA-256)', () => {
    it('should generate a 64-character SHA-256 hash of an IP address', () => {
      const ip = '194.230.144.1';
      const hash = service.hashIp(ip);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toEqual(service.hashIp(ip));
    });
  });
});
