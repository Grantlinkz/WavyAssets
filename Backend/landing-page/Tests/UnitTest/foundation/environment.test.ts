import { describe, it, expect } from 'vitest';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

describe('Foundational Environment & Security Utilities', () => {
  it('should successfully hash and verify passwords using Argon2id', async () => {
    const password = 'InstitutionalSovereignPass123!';
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    expect(hash).toBeDefined();
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const isValid = await argon2.verify(hash, password);
    expect(isValid).toBe(true);

    const isInvalid = await argon2.verify(hash, 'WrongPassword');
    expect(isInvalid).toBe(false);
  });

  it('should generate cryptographically secure 6-digit numeric OTP', () => {
    const otp = crypto.randomInt(100000, 1000000).toString();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('should encrypt and decrypt using AES-256-GCM', () => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const text = 'allocator@zurich-familyoffice.ch';

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    expect(decrypted).toBe(text);
  });
});
