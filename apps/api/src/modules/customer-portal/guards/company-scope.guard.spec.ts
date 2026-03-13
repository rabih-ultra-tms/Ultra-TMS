import { ForbiddenException } from '@nestjs/common';
import { CompanyScopeGuard } from './company-scope.guard';

describe('CompanyScopeGuard', () => {
  let guard: CompanyScopeGuard;

  const makeContext = (req: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => req }),
    }) as any;

  beforeEach(() => {
    guard = new CompanyScopeGuard();
  });

  describe('canActivate - Company Access', () => {
    it('should allow access when user companyId matches requested scope', () => {
      const req: any = {
        portalUser: {
          id: 'user-123',
          companyId: 'company-1',
          tenantId: 'tenant-1',
        },
      };

      const result = guard.canActivate(makeContext(req));

      expect(result).toBe(true);
      expect(req.customerId).toBe('company-1');
    });

    it('should reject access when portalUser not associated with company', () => {
      const ctx = makeContext({
        portalUser: {
          id: 'user-123',
          companyId: null,
          tenantId: 'tenant-1',
        },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow(
        'User is not associated with a customer account'
      );
    });

    it('should reject access when portalUser missing', () => {
      const ctx = makeContext({ portalUser: null });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should reject access when portalUser has undefined companyId', () => {
      const ctx = makeContext({
        portalUser: {
          id: 'user-123',
          tenantId: 'tenant-1',
        },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should reject access when portalUser has empty string companyId', () => {
      const ctx = makeContext({
        portalUser: {
          id: 'user-123',
          companyId: '',
          tenantId: 'tenant-1',
        },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('canActivate - Scope Injection', () => {
    it('should set customerId on request from portalUser', () => {
      const req: any = {
        portalUser: {
          id: 'user-456',
          companyId: 'company-2',
          tenantId: 'tenant-2',
        },
      };

      guard.canActivate(makeContext(req));

      expect(req.customerId).toBe('company-2');
    });

    it('should set companyScope object with correct structure', () => {
      const req: any = {
        portalUser: {
          id: 'user-789',
          companyId: 'company-3',
          tenantId: 'tenant-3',
        },
      };

      guard.canActivate(makeContext(req));

      expect(req.companyScope).toBeDefined();
      expect(req.companyScope.type).toBe('CUSTOMER');
      expect(req.companyScope.id).toBe('company-3');
      expect(req.companyScope.tenantId).toBe('tenant-3');
    });

    it('should preserve portalUser data while setting scope', () => {
      const portalUserData = {
        id: 'user-999',
        email: 'test@example.com',
        companyId: 'company-4',
        tenantId: 'tenant-4',
        role: 'ADMIN',
      };

      const req: any = { portalUser: portalUserData };

      guard.canActivate(makeContext(req));

      expect(req.portalUser).toEqual(portalUserData);
      expect(req.customerId).toBe('company-4');
      expect(req.companyScope.id).toBe('company-4');
    });
  });

  describe('canActivate - Company Isolation', () => {
    it('should correctly isolate different companies', () => {
      const req1: any = {
        portalUser: {
          id: 'user-1',
          companyId: 'company-alpha',
          tenantId: 'tenant-1',
        },
      };

      const req2: any = {
        portalUser: {
          id: 'user-2',
          companyId: 'company-beta',
          tenantId: 'tenant-1',
        },
      };

      const ctx1 = makeContext(req1);
      const ctx2 = makeContext(req2);

      const result1 = guard.canActivate(ctx1);
      const result2 = guard.canActivate(ctx2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(req1.customerId).toBe('company-alpha');
      expect(req2.customerId).toBe('company-beta');
      expect(req1.companyScope.id).not.toBe(req2.companyScope.id);
    });

    it('should handle UUID-format company IDs', () => {
      const companyUuid = '550e8400-e29b-41d4-a716-446655440000';

      const req: any = {
        portalUser: {
          id: 'user-123',
          companyId: companyUuid,
          tenantId: 'tenant-1',
        },
      };

      const result = guard.canActivate(makeContext(req));

      expect(result).toBe(true);
      expect(req.customerId).toBe(companyUuid);
      expect(req.companyScope.id).toBe(companyUuid);
    });

    it('should enforce company scope across multiple activations', () => {
      const companyId = 'company-secure';

      const req: any = {
        portalUser: {
          id: 'user-123',
          companyId: companyId,
          tenantId: 'tenant-1',
        },
      };

      const ctx = makeContext(req);

      guard.canActivate(ctx);
      guard.canActivate(ctx);
      guard.canActivate(ctx);

      expect(req.customerId).toBe(companyId);
      expect(req.companyScope.id).toBe(companyId);
    });
  });

  describe('canActivate - Multi-tenant Support', () => {
    it('should preserve tenantId from portalUser in scope', () => {
      const req: any = {
        portalUser: {
          id: 'user-123',
          companyId: 'company-1',
          tenantId: 'tenant-xyz',
        },
      };

      guard.canActivate(makeContext(req));

      expect(req.companyScope.tenantId).toBe('tenant-xyz');
    });

    it('should handle different tenants with same company ID', () => {
      const req1: any = {
        portalUser: {
          id: 'user-1',
          companyId: 'company-shared',
          tenantId: 'tenant-1',
        },
      };

      const req2: any = {
        portalUser: {
          id: 'user-2',
          companyId: 'company-shared',
          tenantId: 'tenant-2',
        },
      };

      guard.canActivate(makeContext(req1));
      guard.canActivate(makeContext(req2));

      expect(req1.companyScope.tenantId).toBe('tenant-1');
      expect(req2.companyScope.tenantId).toBe('tenant-2');
      expect(req1.customerId).toBe(req2.customerId);
    });
  });
});
