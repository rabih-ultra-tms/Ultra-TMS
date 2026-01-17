import { LocalStorageService } from './local-storage.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  access: jest.fn(),
}));

describe('LocalStorageService', () => {
  let configService: { get: jest.Mock };

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'STORAGE_LOCAL_PATH') return './uploads';
        if (key === 'STORAGE_PUBLIC_URL') return 'http://localhost:3001/uploads';
        return defaultValue;
      }),
    };
  });

  it('initializes storage directory', async () => {
    const service = new LocalStorageService(configService as unknown as ConfigService);

    await service.onModuleInit();

    expect(fs.mkdir).toHaveBeenCalledWith('./uploads', { recursive: true });
  });

  it('uploads file and returns url', async () => {
    const service = new LocalStorageService(configService as unknown as ConfigService);

    const result = await service.upload(Buffer.from('data'), 'file.txt');

    expect(fs.writeFile).toHaveBeenCalled();
    expect(result).toBe('http://localhost:3001/uploads/file.txt');
  });

  it('uploads file to subfolder', async () => {
    const service = new LocalStorageService(configService as unknown as ConfigService);

    const result = await service.upload(Buffer.from('data'), 'file.txt', 'docs');

    expect(result).toBe('http://localhost:3001/uploads/docs/file.txt');
  });

  it('throws on upload error', async () => {
    (fs.writeFile as jest.Mock).mockRejectedValue(new Error('fail'));
    const service = new LocalStorageService(configService as unknown as ConfigService);

    await expect(service.upload(Buffer.from('data'), 'file.txt')).rejects.toThrow('File upload failed');
  });

  it('deletes file', async () => {
    const service = new LocalStorageService(configService as unknown as ConfigService);

    await service.delete('file.txt');

    expect(fs.unlink).toHaveBeenCalled();
  });

  it('throws on delete error', async () => {
    (fs.unlink as jest.Mock).mockRejectedValue(new Error('fail'));
    const service = new LocalStorageService(configService as unknown as ConfigService);

    await expect(service.delete('file.txt')).rejects.toThrow('File deletion failed');
  });

  it('returns signed url with expiry', async () => {
    const service = new LocalStorageService(configService as unknown as ConfigService);

    const result = await service.getSignedUrl('file.txt', { expiresIn: 60 });

    expect(result).toContain('expiresAt=');
  });

  it('checks if file exists', async () => {
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    const service = new LocalStorageService(configService as unknown as ConfigService);

    const exists = await service.exists('file.txt');

    expect(exists).toBe(true);
  });

  it('returns false when file does not exist', async () => {
    (fs.access as jest.Mock).mockRejectedValue(new Error('missing'));
    const service = new LocalStorageService(configService as unknown as ConfigService);

    const exists = await service.exists('file.txt');

    expect(exists).toBe(false);
  });
});
