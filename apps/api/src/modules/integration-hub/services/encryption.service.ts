import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    this.key = this.resolveKey();
  }

  encrypt(plaintext?: string | null): string | null {
    if (!plaintext) return null;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(ciphertext?: string | null): string | null {
    if (!ciphertext) return null;
    if (!ciphertext.includes(':')) return ciphertext;

    try {
      const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
      if (!ivHex || !authTagHex || !encrypted) {
        return null;
      }
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      return null;
    }
  }

  private resolveKey(): Buffer {
    const keyHex = this.configService.get<string>('ENCRYPTION_KEY');
    if (keyHex && keyHex.length >= 64) {
      return Buffer.from(keyHex.slice(0, 64), 'hex');
    }

    const fallback =
      this.configService.get<string>('JWT_SECRET') ||
      this.configService.get<string>('PORTAL_JWT_SECRET') ||
      'local-dev-secret';

    return crypto.createHash('sha256').update(fallback).digest();
  }
}
