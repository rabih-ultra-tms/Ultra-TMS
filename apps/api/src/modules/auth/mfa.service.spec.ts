import { MfaService } from './mfa.service';
import { ConfigService } from '@nestjs/config';

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('abcd')),
}));

describe('MfaService', () => {
  it('returns disabled when MFA off', async () => {
    const config = { get: jest.fn(() => 'false') } as unknown as ConfigService;
    const service = new MfaService(config);

    expect(service.isEnabled()).toBe(false);
    expect(service.isEnabledForUser({ mfaEnabled: true })).toBe(false);

    const secret = await service.generateSecret('u1');
    expect(secret.secret).toContain('STUB_SECRET_');

    const verified = await service.verifyCode('u1', '123456', 'secret');
    expect(verified).toBe(true);
  });

  it('no-ops for stub methods when MFA disabled', async () => {
    const config = { get: jest.fn(() => 'false') } as unknown as ConfigService;
    const service = new MfaService(config);

    await expect(service.enableForUser('u1', 'secret')).resolves.toBeUndefined();
    await expect(service.disableForUser('u1')).resolves.toBeUndefined();
    await expect(service.generateBackupCodes('u1')).resolves.toEqual([]);
    await expect(service.sendCodeViaEmail('u1', 'a@b.com')).resolves.toBeUndefined();
    await expect(service.sendCodeViaSms('u1', '+1555')).resolves.toBeUndefined();
  });

  it('uses user flag when MFA enabled', () => {
    const config = { get: jest.fn(() => 'true') } as unknown as ConfigService;
    const service = new MfaService(config);

    expect(service.isEnabled()).toBe(true);
    expect(service.isEnabledForUser({ mfaEnabled: true })).toBe(true);
    expect(service.isEnabledForUser({ mfaEnabled: false })).toBe(false);
  });

  it('throws for stub methods when MFA enabled', async () => {
    const config = { get: jest.fn(() => 'true') } as unknown as ConfigService;
    const service = new MfaService(config);

    await expect(service.generateSecret('u1')).rejects.toThrow('MFA not fully implemented yet');
    await expect(service.verifyCode('u1', '123456', 'secret')).rejects.toThrow('MFA not fully implemented yet');
    await expect(service.enableForUser('u1', 'secret')).rejects.toThrow('MFA not fully implemented yet');
    await expect(service.disableForUser('u1')).rejects.toThrow('MFA not fully implemented yet');
    await expect(service.generateBackupCodes('u1')).rejects.toThrow('MFA not fully implemented yet');
    await expect(service.sendCodeViaEmail('u1', 'a@b.com')).rejects.toThrow('MFA not fully implemented yet');
    await expect(service.sendCodeViaSms('u1', '+1555')).rejects.toThrow('MFA not fully implemented yet');
  });
});
