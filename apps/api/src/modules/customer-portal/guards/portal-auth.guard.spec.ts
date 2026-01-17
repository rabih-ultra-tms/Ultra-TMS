import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortalAuthGuard } from './portal-auth.guard';
import { PrismaService } from '../../../prisma.service';

describe('PortalAuthGuard', () => {
  let guard: PortalAuthGuard;
  let jwt: { verify: jest.Mock };
  let prisma: any;

  const makeContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;

  beforeEach(() => {
    jwt = { verify: jest.fn() };
    prisma = { portalUser: { findFirst: jest.fn() } };
    guard = new PortalAuthGuard(jwt as unknown as JwtService, prisma as PrismaService);
  });

  it('throws when missing token', async () => {
    const ctx = makeContext({ headers: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws when secret missing', async () => {
    const ctx = makeContext({ headers: { authorization: 'Bearer token' } });
    const original = process.env.CUSTOMER_PORTAL_JWT_SECRET;
    delete process.env.CUSTOMER_PORTAL_JWT_SECRET;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);

    process.env.CUSTOMER_PORTAL_JWT_SECRET = original;
  });

  it('throws when token invalid', async () => {
    process.env.CUSTOMER_PORTAL_JWT_SECRET = 'secret';
    jwt.verify.mockImplementation(() => { throw new Error('bad'); });
    const ctx = makeContext({ headers: { authorization: 'Bearer token' } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('sets user on request', async () => {
    process.env.CUSTOMER_PORTAL_JWT_SECRET = 'secret';
    jwt.verify.mockReturnValue({ sub: 'u1', tenantId: 't1' });
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1', tenantId: 't1' });
    const req: any = { headers: { authorization: 'Bearer token' } };

    const result = await guard.canActivate(makeContext(req));

    expect(result).toBe(true);
    expect(req.portalUser.id).toBe('u1');
  });
});
