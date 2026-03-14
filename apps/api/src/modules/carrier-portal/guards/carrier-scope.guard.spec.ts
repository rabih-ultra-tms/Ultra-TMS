import { ForbiddenException } from '@nestjs/common';
import { CarrierScopeGuard } from './carrier-scope.guard';

describe('CarrierScopeGuard', () => {
  const guard = new CarrierScopeGuard();

  const makeContext = (req: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => req }),
    }) as any;

  describe('Valid Scope Scenarios', () => {
    it('allows request when carrier ID is present', () => {
      const req: any = {
        carrierPortalUser: { carrierId: 'carrier-1', tenantId: 'tenant-1' },
      };
      const ctx = makeContext(req);

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
    });

    it('sets carrierId on request', () => {
      const req: any = {
        carrierPortalUser: { carrierId: 'carrier-1', tenantId: 'tenant-1' },
      };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierId).toBe('carrier-1');
    });

    it('sets carrierScope on request with correct structure', () => {
      const req: any = {
        carrierPortalUser: {
          carrierId: 'carrier-1',
          tenantId: 'tenant-1',
          id: 'user-1',
        },
      };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierScope).toEqual({
        type: 'CARRIER',
        id: 'carrier-1',
        tenantId: 'tenant-1',
      });
    });

    it('returns true after setting scope', () => {
      const req: any = {
        carrierPortalUser: { carrierId: 'carrier-1', tenantId: 'tenant-1' },
      };
      const ctx = makeContext(req);

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
    });
  });

  describe('Missing Scope Scenarios', () => {
    it('throws ForbiddenException when carrierId is missing', () => {
      const ctx = makeContext({
        carrierPortalUser: { id: 'user-1', tenantId: 'tenant-1' },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('throws ForbiddenException with descriptive message', () => {
      const ctx = makeContext({ carrierPortalUser: { id: 'user-1' } });

      expect(() => guard.canActivate(ctx)).toThrow(
        'User is not associated with a carrier account'
      );
    });

    it('throws when carrierId is undefined', () => {
      const ctx = makeContext({
        carrierPortalUser: { id: 'user-1', carrierId: undefined },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('throws when carrierId is null', () => {
      const ctx = makeContext({
        carrierPortalUser: { id: 'user-1', carrierId: null },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('throws when carrierId is empty string', () => {
      const ctx = makeContext({
        carrierPortalUser: { id: 'user-1', carrierId: '' },
      });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('Scope Data Integrity', () => {
    it('extracts carrier ID from user object', () => {
      const req: any = {
        carrierPortalUser: { carrierId: 'carrier-123', tenantId: 'tenant-abc' },
      };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierId).toBe('carrier-123');
    });

    it('extracts tenant ID from user object', () => {
      const req: any = {
        carrierPortalUser: { carrierId: 'carrier-1', tenantId: 'tenant-xyz' },
      };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierScope.tenantId).toBe('tenant-xyz');
    });

    it('marks scope type as CARRIER', () => {
      const req: any = {
        carrierPortalUser: { carrierId: 'carrier-1', tenantId: 'tenant-1' },
      };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierScope.type).toBe('CARRIER');
    });

    it('preserves original user data while setting scope', () => {
      const user = {
        carrierId: 'carrier-1',
        tenantId: 'tenant-1',
        id: 'user-1',
        email: 'test@example.com',
      };
      const req: any = { carrierPortalUser: user };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierPortalUser).toBe(user);
      expect(req.carrierId).toBe('carrier-1');
    });
  });

  describe('Edge Cases', () => {
    it('handles carrier ID with special characters', () => {
      const req: any = {
        carrierPortalUser: {
          carrierId: 'carrier-abc_123-xyz',
          tenantId: 'tenant-1',
        },
      };
      const ctx = makeContext(req);

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(req.carrierId).toBe('carrier-abc_123-xyz');
    });

    it('handles UUID format carrier ID', () => {
      const carrierId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const req: any = {
        carrierPortalUser: { carrierId, tenantId: 'tenant-1' },
      };
      const ctx = makeContext(req);

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(req.carrierId).toBe(carrierId);
    });

    it('throws when carrierPortalUser object is missing entirely', () => {
      const ctx = makeContext({});

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('throws when carrierPortalUser is null', () => {
      const ctx = makeContext({ carrierPortalUser: null });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('throws when carrierPortalUser is undefined', () => {
      const ctx = makeContext({ carrierPortalUser: undefined });

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('Integration Scenarios', () => {
    it('works correctly after auth guard has set user', () => {
      const req: any = {
        carrierPortalUser: {
          id: 'user-1',
          tenantId: 'tenant-1',
          carrierId: 'carrier-1',
          email: 'carrier@test.com',
          role: 'ADMIN',
        },
      };
      const ctx = makeContext(req);

      const result = guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(req.carrierScope).toEqual({
        type: 'CARRIER',
        id: 'carrier-1',
        tenantId: 'tenant-1',
      });
    });

    it('maintains full user object after scope guard activation', () => {
      const user = {
        id: 'user-1',
        tenantId: 'tenant-1',
        carrierId: 'carrier-1',
        email: 'carrier@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'DISPATCHER',
      };
      const req: any = { carrierPortalUser: user };
      const ctx = makeContext(req);

      guard.canActivate(ctx);

      expect(req.carrierPortalUser).toEqual(user);
      expect(req.carrierId).toBe('carrier-1');
      expect(req.carrierScope.id).toBe('carrier-1');
    });
  });
});
