import { EncryptionService } from './encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
  const config = {
    get: jest.fn((key: string) => {
      if (key === 'ENCRYPTION_KEY') {
        return 'a'.repeat(64);
      }
      return undefined;
    }),
  } as unknown as ConfigService;

  it('encrypts and decrypts', () => {
    const service = new EncryptionService(config);

    const encrypted = service.encrypt('hello');
    const decrypted = service.decrypt(encrypted!);

    expect(decrypted).toBe('hello');
  });

  it('returns null for invalid ciphertext', () => {
    const service = new EncryptionService(config);

    const result = service.decrypt('bad');

    expect(result).toBe('bad');
  });

  it('returns null on malformed ciphertext', () => {
    const service = new EncryptionService(config);

    const result = service.decrypt('a:b');

    expect(result).toBeNull();
  });
});
