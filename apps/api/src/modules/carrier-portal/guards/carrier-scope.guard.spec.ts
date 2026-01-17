import { ForbiddenException } from '@nestjs/common';
import { CarrierScopeGuard } from './carrier-scope.guard';

describe('CarrierScopeGuard', () => {
  const guard = new CarrierScopeGuard();

  const makeContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;

  it('throws when carrier missing', () => {
    const ctx = makeContext({ carrierPortalUser: { id: 'u1' } });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('sets carrier scope', () => {
    const req: any = { carrierPortalUser: { carrierId: 'c1', tenantId: 't1' } };
    const ctx = makeContext(req);

    const result = guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.carrierId).toBe('c1');
  });
});
