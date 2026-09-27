import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

@Injectable()
export class CryptoService {
  private readonly encryptionKey: Buffer;
  private readonly hmacSecret: string;

  constructor() {
    const rawKey =
      process.env.FIELD_ENCRYPTION_KEY ||
      process.env.CIPHER_KEY_HEX ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    this.encryptionKey = Buffer.from(rawKey.padEnd(64, '0').slice(0, 64), 'hex');
    this.hmacSecret =
      process.env.JWT_SECRET || 'wavy_admin_jwt_access_super_secret_sovereign_enclave_2026';
  }

  /**
   * Hashes a password or passphrase using Argon2id.
   */
  async hashPassword(password: string): Promise<string> {
    const isProd = process.env.NODE_ENV === 'production';
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: isProd ? 65536 : 2048,
      timeCost: isProd ? 3 : 2,
      parallelism: isProd ? 4 : 1,
    });
  }

  /**
   * Verifies a plain password against an Argon2id hash.
   */
  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Encrypts plaintext using AES-256-GCM.
   * Returns format: iv:authTag:ciphertext (hex encoded)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) return '';
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
  }

  /**
   * Decrypts an AES-256-GCM encrypted payload (iv:authTag:ciphertext).
   * Gracefully returns original text if not in encrypted format.
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      return encryptedText;
    }

    try {
      const [ivHex, authTagHex, cipherHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      let plaintext = decipher.update(cipherHex, 'hex', 'utf8');
      plaintext += decipher.final('utf8');
      return plaintext;
    } catch {
      return encryptedText;
    }
  }

  /**
   * Computes an HMAC-SHA256 blind index hash for exact-match database queries.
   */
  hashBlindIndex(val: string): string {
    if (!val) return '';
    const normalized = val.toLowerCase().trim();
    return crypto.createHmac('sha256', this.hmacSecret).update(normalized).digest('hex');
  }

  /**
   * Computes a SHA-256 one-way hash for IP addresses (GDPR / zero PII compliance).
   */
  hashIp(ip: string): string {
    if (!ip) return '';
    return crypto.createHash('sha256').update(ip.trim()).digest('hex');
  }

  hashIpAddress(ip: string): string {
    return this.hashIp(ip);
  }
}
