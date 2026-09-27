import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TotpService {
  private readonly base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  /**
   * Generates a 20-byte random Base32 encoded TOTP secret (160 bits, RFC 4226/6238 recommendation).
   */
  generateSecret(length = 32): string {
    const randomBytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < randomBytes.length; i++) {
      result += this.base32Chars[randomBytes[i] % 32];
    }
    return result;
  }

  /**
   * Generates a 6-digit TOTP code for the given secret at the specified step offset.
   */
  generateTotp(secret: string, windowOffset = 0): string {
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const counter = Math.floor(epoch / timeStep) + windowOffset;

    return this.calculateTotpCode(secret, counter);
  }

  /**
   * Verifies an entered 6-digit TOTP code against a secret within an allowed window (default +/- 1 step = 30s).
   */
  verifyTotp(token: string, secret: string, window = 1): boolean {
    if (!token || !secret || token.length !== 6) {
      return false;
    }

    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const currentCounter = Math.floor(epoch / timeStep);

    for (let offset = -window; offset <= window; offset++) {
      const generatedCode = this.calculateTotpCode(secret, currentCounter + offset);
      if (generatedCode === token) {
        return true;
      }
    }

    return false;
  }

  private calculateTotpCode(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;

    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  private base32Decode(base32: string): Buffer {
    const cleaned = base32.toUpperCase().replace(/=+$/, '');
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      const index = this.base32Chars.indexOf(char);
      if (index === -1) continue;

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }
}
