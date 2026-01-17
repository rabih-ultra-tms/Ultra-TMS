import { RateLimitGuard } from './rate-limit.guard';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  const rateLimitService = {
    getByKey: jest.fn(),
    reset: jest.fn(),
    incrementUsage: jest.fn(),
  };

  const makeContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;

  beforeEach(() => {
    guard = new RateLimitGuard(rateLimitService as unknown as RateLimitService);
  });

  it('allows when no record', async () => {
    rateLimitService.getByKey.mockResolvedValue(null);

    const result = await guard.canActivate(makeContext({ ip: '1.2.3.4' }));

    expect(result).toBe(true);
  });

  it('blocks when max requests reached', async () => {
    rateLimitService.getByKey.mockResolvedValue({
      windowStartsAt: new Date(),
      windowSeconds: 60,
      currentRequests: 5,
      maxRequests: 5,
    });

    const result = await guard.canActivate(makeContext({ ip: '1.2.3.4' }));

    expect(result).toBe(false);
  });

  it('resets when window expired', async () => {
    rateLimitService.getByKey.mockResolvedValue({
      windowStartsAt: new Date(Date.now() - 120000),
      windowSeconds: 60,
      currentRequests: 5,
      maxRequests: 10,
    });

    const result = await guard.canActivate(makeContext({ ip: '1.2.3.4' }));

    expect(result).toBe(true);
    expect(rateLimitService.reset).toHaveBeenCalled();
    expect(rateLimitService.incrementUsage).toHaveBeenCalled();
  });
});
