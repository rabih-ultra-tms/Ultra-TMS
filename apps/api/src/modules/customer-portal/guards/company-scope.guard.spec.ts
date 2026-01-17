import { ForbiddenException } from '@nestjs/common';
import { CompanyScopeGuard } from './company-scope.guard';

describe('CompanyScopeGuard', () => {
  const guard = new CompanyScopeGuard();

  const makeContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;

  it('throws when company missing', () => {
    const ctx = makeContext({ portalUser: { id: 'u1' } });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('sets company scope', () => {
    const req: any = { portalUser: { companyId: 'c1', tenantId: 't1' } };

    const result = guard.canActivate(makeContext(req));

    expect(result).toBe(true);
    expect(req.customerId).toBe('c1');
  });
});
