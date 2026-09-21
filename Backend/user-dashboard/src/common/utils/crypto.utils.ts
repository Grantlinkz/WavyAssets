import * as crypto from 'crypto';
import { BadRequestException } from '@nestjs/common';

export class CryptoUtils {
  /**
   * Deterministic  hash
   */
  public static hashHmacSha256(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Generates a cryptographically secure random hex string
   */
  public static generateRandomHex(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Constant-time string equality check to prevent timing attacks
   */
  public static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Symmetric AES-256-GCM encryption
   * Output format: iv:authTag:encryptedContent (all hex)
   */
  public static encryptAes256Gcm(text: string, keyHex: string): string {
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const key = Buffer.from(keyHex, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  /**
   * Symmetric AES-256-GCM decryption
   * Input format: iv:authTag:encryptedContent (all hex)
   */
  public static decryptAes256Gcm(payload: string, keyHex: string): string {
    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new BadRequestException('Malformed AES-256-GCM ciphertext envelope');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const key = Buffer.from(keyHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
