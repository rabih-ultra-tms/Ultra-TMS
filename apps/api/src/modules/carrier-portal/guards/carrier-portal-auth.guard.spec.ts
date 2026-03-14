import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CarrierPortalAuthGuard } from './carrier-portal-auth.guard';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalAuthGuard', () => {
  let guard: CarrierPortalAuthGuard;
  let jwt: { verify: jest.Mock };
  let prisma: any;

  const makeContext = (req: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => req }),
    }) as any;

  beforeEach(() => {
    jwt = { verify: jest.fn() };
    prisma = { carrierPortalUser: { findFirst: jest.fn() } };
    guard = new CarrierPortalAuthGuard(
      jwt as unknown as JwtService,
      prisma as PrismaService
    );
  });

  describe('Valid Token Scenarios', () => {
    it('allows request with valid JWT token', async () => {
      process.env.CARRIER_PORTAL_JWT_SECRET = 'test-secret';
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'carrier@test.com',
        carrierId: 'carrier-1',
        deletedAt: null,
      });

      const req: any = { headers: { authorization: 'Bearer valid-token' } };
      const ctx = makeContext(req);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(req.carrierPortalUser.id).toBe('user-1');
      expect(req.tenantId).toBe('tenant-1');
    });

    it('skips token verification if user already on request', async () => {
      const existingUser = { id: 'user-1', tenantId: 'tenant-1' };
      const req: any = { headers: {}, carrierPortalUser: existingUser };
      const ctx = makeContext(req);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(jwt.verify).not.toHaveBeenCalled();
    });
  });

  describe('Missing Token Scenarios', () => {
    it('throws UnauthorizedException when missing authorization header', async () => {
      const ctx = makeContext({ headers: {} });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Missing carrier portal token'
      );
    });

    it('throws UnauthorizedException when authorization header missing Bearer prefix', async () => {
      const ctx = makeContext({ headers: { authorization: 'Basic token' } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Missing carrier portal token'
      );
    });

    it('throws UnauthorizedException when empty token string provided', async () => {
      const ctx = makeContext({ headers: { authorization: 'Bearer ' } });
      process.env.CARRIER_PORTAL_JWT_SECRET = 'secret';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('Configuration Scenarios', () => {
    it('throws when JWT secret not configured', async () => {
      const ctx = makeContext({ headers: { authorization: 'Bearer token' } });
      const original = process.env.CARRIER_PORTAL_JWT_SECRET;
      delete process.env.CARRIER_PORTAL_JWT_SECRET;

      try {
        await expect(guard.canActivate(ctx)).rejects.toThrow(
          UnauthorizedException
        );
        await expect(guard.canActivate(ctx)).rejects.toThrow(
          'Carrier portal JWT secret not configured'
        );
      } finally {
        process.env.CARRIER_PORTAL_JWT_SECRET = original;
      }
    });
  });

  describe('Token Validation Scenarios', () => {
    beforeEach(() => {
      process.env.CARRIER_PORTAL_JWT_SECRET = 'test-secret';
    });

    it('throws UnauthorizedException when token is expired', async () => {
      jwt.verify.mockImplementation(() => {
        const err = new Error('jwt expired');
        (err as any).name = 'TokenExpiredError';
        throw err;
      });
      const ctx = makeContext({
        headers: { authorization: 'Bearer expired-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Invalid carrier portal token'
      );
    });

    it('throws UnauthorizedException when token is malformed', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });
      const ctx = makeContext({
        headers: { authorization: 'Bearer malformed-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('throws UnauthorizedException when token is signed with different secret', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });
      const ctx = makeContext({
        headers: { authorization: 'Bearer wrong-secret-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('Database Lookup Scenarios', () => {
    beforeEach(() => {
      process.env.CARRIER_PORTAL_JWT_SECRET = 'test-secret';
    });

    it('throws when carrier portal user not found', async () => {
      jwt.verify.mockReturnValue({ sub: 'unknown-user', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue(null);
      const ctx = makeContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('throws when user is soft-deleted', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue(null);
      const ctx = makeContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('checks user belongs to correct tenant', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        carrierId: 'carrier-1',
      });
      const ctx = makeContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      await guard.canActivate(ctx);

      expect(prisma.carrierPortalUser.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
          tenantId: 'tenant-1',
          deletedAt: null,
        },
      });
    });

    it('does not return soft-deleted users', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue(null);
      const ctx = makeContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );

      expect(prisma.carrierPortalUser.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        })
      );
    });
  });

  describe('Request Mutation', () => {
    beforeEach(() => {
      process.env.CARRIER_PORTAL_JWT_SECRET = 'test-secret';
    });

    it('sets carrierPortalUser on request', async () => {
      const user = {
        id: 'user-1',
        tenantId: 'tenant-1',
        carrierId: 'carrier-1',
        email: 'test@example.com',
      };
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue(user);
      const req: any = { headers: { authorization: 'Bearer token' } };
      const ctx = makeContext(req);

      await guard.canActivate(ctx);

      expect(req.carrierPortalUser).toEqual(user);
    });

    it('sets tenantId on request', async () => {
      const user = {
        id: 'user-1',
        tenantId: 'tenant-1',
        carrierId: 'carrier-1',
      };
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue(user);
      const req: any = { headers: { authorization: 'Bearer token' } };
      const ctx = makeContext(req);

      await guard.canActivate(ctx);

      expect(req.tenantId).toBe('tenant-1');
    });

    it('returns true after successful activation', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        carrierId: 'carrier-1',
      });
      const ctx = makeContext({ headers: { authorization: 'Bearer token' } });

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      process.env.CARRIER_PORTAL_JWT_SECRET = 'test-secret';
    });

    it('handles concurrent token verification requests', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-1', tenantId: 'tenant-1' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
      });

      const ctx1 = makeContext({ headers: { authorization: 'Bearer token1' } });
      const ctx2 = makeContext({ headers: { authorization: 'Bearer token2' } });

      const [result1, result2] = await Promise.all([
        guard.canActivate(ctx1),
        guard.canActivate(ctx2),
      ]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('extracts sub and tenantId from token payload', async () => {
      jwt.verify.mockReturnValue({ sub: 'user-123', tenantId: 'tenant-abc' });
      prisma.carrierPortalUser.findFirst.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-abc',
      });
      const ctx = makeContext({ headers: { authorization: 'Bearer token' } });

      await guard.canActivate(ctx);

      expect(prisma.carrierPortalUser.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-123',
          tenantId: 'tenant-abc',
          deletedAt: null,
        },
      });
    });
  });
});
