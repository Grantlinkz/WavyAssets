import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly hmacSecret: string;
  private readonly fieldEncryptionKey: Buffer;
  private readonly handoffSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.hmacSecret =
      this.configService.get<string>('security.jwtSecret') ||
      'wavy_default_Global_hmac_secret_key_minimum_64_characters_length_required!';

    const handoffConfig = this.configService.get<string>('security.handoffTicketSecret');
    if (!handoffConfig) {
      throw new Error('HANDOFF_TICKET_SECRET is missing from configuration');
    }
    this.handoffSecret = handoffConfig;

    const keyHex =
      this.configService.get<string>('security.fieldEncryptionKey') ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.fieldEncryptionKey = Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex');
  }

  /**
   * Hashes passwords using Argon2id with memory-hard institutional parameters.
   */
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Constant-time password verification against an Argon2id hash.
   */
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      this.logger.warn('Password verification failed due to malformed hash structure');
      return false;
    }
  }

  /**
   * Generates a cryptographically secure 6-digit numeric OTP.
   */
  generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  /**
   * Hashes an OTP code using Argon2id for database persistence.
   */
  async hashOtp(otp: string): Promise<string> {
    return argon2.hash(otp, {
      type: argon2.argon2id,
      memoryCost: 16384, // 16 MB for fast OTP verification cycle
      timeCost: 2,
      parallelism: 2,
    });
  }

  /**
   * Verifies an OTP code against its Argon2id hash in constant time.
   */
  async verifyOtp(hash: string, otp: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, otp);
    } catch {
      return false;
    }
  }

  /**
   * Computes a deterministic  hash for bearer tokens (refreshToken).
   * Ensures bearer credentials are never stored in plaintext in the SQLite database.
   */
  hashToken(token: string): string {
    return crypto.createHmac('sha256', this.hmacSecret).update(token).digest('hex');
  }

  /**
   * Computes a deterministic  hash for single-use Authentications
   * using the shared HANDOFF_TICKET_SECRET, matching Backend/user-dashboard.
   */
  hashHandoffTicket(ticket: string): string {
    return crypto.createHmac('sha256', this.handoffSecret).update(ticket).digest('hex');
  }

  /**
   * Generates a high-entropy cryptographically secure random token (hex encoded).
   */
  generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generates a unique dashboard handoff exchange ticket.
   */
  generateHandoffTicket(): string {
    return `wavy_ticket_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Generates a unique refresh token.
   */
  generateRefreshToken(): string {
    return `wavy_refresh_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Encrypts plaintext using AES-256-GCM authenticated encryption.
   * Returns format: `${ivHex}:${authTagHex}:${ciphertextHex}`.
   */
  encryptField(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.fieldEncryptionKey, iv);
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
  }

  /**
   * Decrypts ciphertext formatted as `${ivHex}:${authTagHex}:${ciphertextHex}` using AES-256-GCM.
   */
  decryptField(encryptedPayload: string): string {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed encrypted payload structure');
    }
    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.fieldEncryptionKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Computes a deterministic  blind index hash for indexed lookups on encrypted fields (e.g. workEmailHash).
   * Strips whitespace and lowercases string for exact lookup consistency.
   */
  hashBlindIndex(value: string): string {
    const normalized = value.toLowerCase().trim();
    return crypto.createHmac('sha256', this.hmacSecret).update(normalized).digest('hex');
  }

  /**
   * Deterministically hashes an IP address for GDPR-compliant zero-raw-IP audit logging.
   */
  hashIpAddress(ip: string): string {
    const normalized = (ip || 'unknown').trim();
    return crypto.createHmac('sha256', this.hmacSecret).update(normalized).digest('hex');
  }
}
