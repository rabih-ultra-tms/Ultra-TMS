import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortalAuthGuard } from './portal-auth.guard';
import { PrismaService } from '../../../prisma.service';

describe('PortalAuthGuard', () => {
  let guard: PortalAuthGuard;
  let jwt: { verify: jest.Mock };
  let prisma: any;

  const makeContext = (req: any) =>
    ({
      switchToHttp: () => ({ getRequest: () => req }),
    }) as any;

  beforeEach(() => {
    jwt = { verify: jest.fn() };
    prisma = { portalUser: { findFirst: jest.fn() } };
    guard = new PortalAuthGuard(
      jwt as unknown as JwtService,
      prisma as PrismaService
    );
    process.env.CUSTOMER_PORTAL_JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate - Authentication', () => {
    it('should allow request with valid JWT token', async () => {
      const mockPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-1',
      };

      jwt.verify.mockReturnValue(mockPayload);
      prisma.portalUser.findFirst.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-1',
        email: 'test@example.com',
        companyId: 'company-1',
        deletedAt: null,
      });

      const req: any = { headers: { authorization: 'Bearer valid-token' } };
      const ctx = makeContext(req);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(req.portalUser.id).toBe('user-123');
      expect(req.tenantId).toBe('tenant-1');
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret-key',
      });
    });

    it('should reject request without authorization header', async () => {
      const ctx = makeContext({ headers: {} });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Missing portal access token'
      );
    });

    it('should reject request with malformed authorization header', async () => {
      const ctx = makeContext({
        headers: { authorization: 'InvalidFormat token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Missing portal access token'
      );
    });

    it('should reject request with invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const ctx = makeContext({
        headers: { authorization: 'Bearer invalid-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Invalid portal access token'
      );
    });

    it('should reject request with expired token', async () => {
      jwt.verify.mockImplementation(() => {
        const err = new Error('Token expired');
        (err as any).name = 'TokenExpiredError';
        throw err;
      });

      const ctx = makeContext({
        headers: { authorization: 'Bearer expired-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should reject when portal user not found in database', async () => {
      const mockPayload = {
        sub: 'user-123',
        tenantId: 'tenant-1',
      };

      jwt.verify.mockReturnValue(mockPayload);
      prisma.portalUser.findFirst.mockResolvedValue(null);

      const ctx = makeContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      // The guard catches the error and throws "Invalid portal access token"
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Invalid portal access token'
      );
    });

    it('should reject when portal user is deleted (soft delete)', async () => {
      const mockPayload = {
        sub: 'user-123',
        tenantId: 'tenant-1',
      };

      jwt.verify.mockReturnValue(mockPayload);
      prisma.portalUser.findFirst.mockResolvedValue(null);

      const ctx = makeContext({
        headers: { authorization: 'Bearer valid-token' },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw when JWT secret not configured', async () => {
      delete process.env.CUSTOMER_PORTAL_JWT_SECRET;
      delete process.env.JWT_SECRET;

      const ctx = makeContext({ headers: { authorization: 'Bearer token' } });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        'Customer portal JWT secret not configured'
      );

      process.env.CUSTOMER_PORTAL_JWT_SECRET = 'test-secret-key';
    });

    it('should fallback to JWT_SECRET when CUSTOMER_PORTAL_JWT_SECRET not set', async () => {
      delete process.env.CUSTOMER_PORTAL_JWT_SECRET;
      process.env.JWT_SECRET = 'fallback-secret';

      const mockPayload = {
        sub: 'user-123',
        tenantId: 'tenant-1',
      };

      jwt.verify.mockReturnValue(mockPayload);
      prisma.portalUser.findFirst.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-1',
        deletedAt: null,
      });

      const req: any = { headers: { authorization: 'Bearer valid-token' } };
      const ctx = makeContext(req);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'fallback-secret',
      });

      process.env.CUSTOMER_PORTAL_JWT_SECRET = 'test-secret-key';
      delete process.env.JWT_SECRET;
    });
  });

  describe('canActivate - Request Injection', () => {
    it('should allow request when portalUser manually injected', async () => {
      const req: any = {
        headers: {},
        portalUser: { id: 'user-123', tenantId: 'tenant-1' },
      };
      const ctx = makeContext(req);

      const result = await guard.canActivate(ctx);

      expect(result).toBe(true);
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should set tenantId on request from portal user', async () => {
      const mockPayload = {
        sub: 'user-123',
        tenantId: 'tenant-abc',
      };

      jwt.verify.mockReturnValue(mockPayload);
      prisma.portalUser.findFirst.mockResolvedValue({
        id: 'user-123',
        tenantId: 'tenant-abc',
        deletedAt: null,
      });

      const req: any = { headers: { authorization: 'Bearer token' } };
      const ctx = makeContext(req);

      await guard.canActivate(ctx);

      expect(req.tenantId).toBe('tenant-abc');
    });
  });

  describe('canActivate - User Verification', () => {
    it('should correctly validate user matches token payload', async () => {
      const mockPayload = {
        sub: 'user-456',
        tenantId: 'tenant-2',
      };

      jwt.verify.mockReturnValue(mockPayload);
      prisma.portalUser.findFirst.mockResolvedValue({
        id: 'user-456',
        tenantId: 'tenant-2',
        email: 'user@example.com',
        deletedAt: null,
      });

      const req: any = { headers: { authorization: 'Bearer token' } };
      const ctx = makeContext(req);

      await guard.canActivate(ctx);

      expect(prisma.portalUser.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'user-456',
          tenantId: 'tenant-2',
          deletedAt: null,
        },
      });
    });

    it('should handle multiple consecutive valid requests', async () => {
      const mockPayload1 = {
        sub: 'user-1',
        tenantId: 'tenant-1',
      };

      const mockPayload2 = {
        sub: 'user-2',
        tenantId: 'tenant-2',
      };

      jwt.verify
        .mockReturnValueOnce(mockPayload1)
        .mockReturnValueOnce(mockPayload2);

      prisma.portalUser.findFirst
        .mockResolvedValueOnce({
          id: 'user-1',
          tenantId: 'tenant-1',
          deletedAt: null,
        })
        .mockResolvedValueOnce({
          id: 'user-2',
          tenantId: 'tenant-2',
          deletedAt: null,
        });

      const req1: any = { headers: { authorization: 'Bearer token1' } };
      const req2: any = { headers: { authorization: 'Bearer token2' } };

      const result1 = await guard.canActivate(makeContext(req1));
      const result2 = await guard.canActivate(makeContext(req2));

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(req1.portalUser.id).toBe('user-1');
      expect(req2.portalUser.id).toBe('user-2');
    });
  });
});
