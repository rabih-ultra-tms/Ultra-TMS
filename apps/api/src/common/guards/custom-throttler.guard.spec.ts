import { ExecutionContext } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  const guard = Object.create(CustomThrottlerGuard.prototype) as CustomThrottlerGuard;

  const makeContext = (path: string) => ({
    switchToHttp: () => ({ getRequest: () => ({ path }) }),
  }) as ExecutionContext;

  it('throws throttling exception', async () => {
    await expect((guard as any).throwThrottlingException({})).rejects.toThrow(ThrottlerException);
  });

  it('builds tracker key', async () => {
    const key = await (guard as any).getTracker({ ip: '1.2.3.4', user: { id: 'u1' } });

    expect(key).toBe('1.2.3.4-u1');
  });

  it('builds tracker key from connection and user sub', async () => {
    const key = await (guard as any).getTracker({ connection: { remoteAddress: '9.9.9.9' }, user: { sub: 'u2' } });

    expect(key).toBe('9.9.9.9-u2');
  });

  it('builds tracker key with defaults', async () => {
    const key = await (guard as any).getTracker({});

    expect(key).toBe('unknown-anonymous');
  });

  it('skips health paths', async () => {
    const result = await (guard as any).shouldSkip(makeContext('/health'));

    expect(result).toBe(true);
  });

  it('does not skip non-health paths', async () => {
    const result = await (guard as any).shouldSkip(makeContext('/api/orders'));

    expect(result).toBe(false);
  });
});
