import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
  const makeConfig = (values: Record<string, string | undefined>) =>
    ({
      get: jest.fn((key: string) => values[key]),
    }) as unknown as ConfigService;

  describe('with ENCRYPTION_KEY', () => {
    const config = makeConfig({ ENCRYPTION_KEY: 'a'.repeat(64) });

    it('encrypts and decrypts', () => {
      const service = new EncryptionService(config);
      const encrypted = service.encrypt('hello');
      expect(service.decrypt(encrypted!)).toBe('hello');
    });

    it('returns plaintext for non-encrypted string', () => {
      const service = new EncryptionService(config);
      expect(service.decrypt('bad')).toBe('bad');
    });

    it('returns null on malformed ciphertext', () => {
      const service = new EncryptionService(config);
      expect(service.decrypt('a:b')).toBeNull();
    });
  });

  describe('fallback key resolution', () => {
    it('throws in production without ENCRYPTION_KEY', () => {
      const config = makeConfig({ NODE_ENV: 'production', JWT_SECRET: 'secret' });
      expect(() => new EncryptionService(config)).toThrow(
        'ENCRYPTION_KEY environment variable is required in production',
      );
    });

    it('uses JWT_SECRET fallback in development', () => {
      const config = makeConfig({ NODE_ENV: 'development', JWT_SECRET: 'dev-secret' });
      const service = new EncryptionService(config);
      const encrypted = service.encrypt('test');
      expect(service.decrypt(encrypted!)).toBe('test');
    });

    it('throws when neither ENCRYPTION_KEY nor JWT_SECRET is set', () => {
      const config = makeConfig({});
      expect(() => new EncryptionService(config)).toThrow(
        'ENCRYPTION_KEY or JWT_SECRET must be set',
      );
    });
  });
});
