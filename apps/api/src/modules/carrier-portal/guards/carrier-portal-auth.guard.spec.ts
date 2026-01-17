import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CarrierPortalAuthGuard } from './carrier-portal-auth.guard';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalAuthGuard', () => {
  let guard: CarrierPortalAuthGuard;
  let jwt: { verify: jest.Mock };
  let prisma: any;

  const makeContext = (req: any) => ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;

  beforeEach(() => {
    jwt = { verify: jest.fn() };
    prisma = { carrierPortalUser: { findFirst: jest.fn() } };
    guard = new CarrierPortalAuthGuard(jwt as unknown as JwtService, prisma as PrismaService);
  });

  it('throws when missing token', async () => {
    const ctx = makeContext({ headers: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws when secret not configured', async () => {
    const ctx = makeContext({ headers: { authorization: 'Bearer token' } });
    const original = process.env.CARRIER_PORTAL_JWT_SECRET;
    delete process.env.CARRIER_PORTAL_JWT_SECRET;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);

    process.env.CARRIER_PORTAL_JWT_SECRET = original;
  });

  it('throws when token invalid', async () => {
    process.env.CARRIER_PORTAL_JWT_SECRET = 'secret';
    jwt.verify.mockImplementation(() => { throw new Error('bad'); });
    const ctx = makeContext({ headers: { authorization: 'Bearer token' } });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('sets user on request', async () => {
    process.env.CARRIER_PORTAL_JWT_SECRET = 'secret';
    jwt.verify.mockReturnValue({ sub: 'u1', tenantId: 't1' });
    prisma.carrierPortalUser.findFirst.mockResolvedValue({ id: 'u1', tenantId: 't1' });
    const req: any = { headers: { authorization: 'Bearer token' } };
    const ctx = makeContext(req);

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(req.carrierPortalUser.id).toBe('u1');
  });
});
