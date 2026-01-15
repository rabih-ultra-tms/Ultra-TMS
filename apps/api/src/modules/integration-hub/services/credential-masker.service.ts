import { Injectable } from '@nestjs/common';

@Injectable()
export class CredentialMaskerService {
  maskObject<T extends Record<string, unknown> | unknown[] | null | undefined>(obj: T): T {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (!item || typeof item !== 'object') {
          return item;
        }
        return this.maskObject(item as Record<string, unknown>);
      }) as T;
    }
    const masked: Record<string, unknown> = { ...obj };

    Object.entries(masked).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (typeof value === 'object') {
        masked[key] = this.maskObject(value as Record<string, unknown> | unknown[]);
        return;
      }
      if (typeof value === 'string' && this.isSensitiveKey(key)) {
        masked[key] = this.maskValue(value);
      }
    });

    return masked as T;
  }

  maskSecret(secret?: string | null): string | null | undefined {
    if (!secret) return secret;
    return '••••••••';
  }

  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'apiKey',
      'apiSecret',
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'privateKey',
      'clientSecret',
    ];
    return sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase()));
  }

  private maskValue(value: string): string {
    if (!value || value.length < 8) {
      return '••••••••';
    }
    return `••••••••${value.slice(-4)}`;
  }
}
