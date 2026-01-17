import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortalAuthService } from './portal-auth.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalAuthService', () => {
  let service: PortalAuthService;
  let prisma: any;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      portalUser: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      portalSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    jwtService = { sign: jest.fn(), verify: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortalAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(PortalAuthService);
  });

  it('logs in with valid credentials', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1', tenantId: 't1', role: 'USER', password: 'pw', status: 'ACTIVE' });
    prisma.portalUser.update.mockResolvedValue({});
    jwtService.sign.mockReturnValueOnce('access').mockReturnValueOnce('refresh');

    const result = await service.login({ email: 'a@b.com', password: 'pw' } as any, {});

    expect(result.accessToken).toBe('access');
    expect(prisma.portalSession.create).toHaveBeenCalled();
  });

  it('rejects suspended user login', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1', tenantId: 't1', role: 'USER', password: 'pw', status: 'SUSPENDED' });

    await expect(service.login({ email: 'a@b.com', password: 'pw' } as any, {})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects invalid credentials', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    await expect(service.login({ email: 'a@b.com', password: 'pw' } as any, {})).rejects.toThrow(UnauthorizedException);
  });

  it('refreshes access token', async () => {
    jwtService.verify.mockReturnValue({ sub: 'u1', type: 'refresh' });
    prisma.portalSession.findFirst.mockResolvedValue({ id: 's1', expiresAt: new Date(Date.now() + 1000) });
    prisma.portalUser.findUnique.mockResolvedValue({ id: 'u1', tenantId: 't1', role: 'USER' });
    jwtService.sign.mockReturnValue('access');

    const result = await service.refresh({ refreshToken: 'token' } as any);

    expect(result.accessToken).toBe('access');
  });

  it('rejects refresh token with wrong type', async () => {
    jwtService.verify.mockReturnValue({ sub: 'u1', type: 'access' });

    await expect(service.refresh({ refreshToken: 'token' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects expired refresh session', async () => {
    jwtService.verify.mockReturnValue({ sub: 'u1', type: 'refresh' });
    prisma.portalSession.findFirst.mockResolvedValue({ id: 's1', expiresAt: new Date(Date.now() - 1000) });

    await expect(service.refresh({ refreshToken: 'token' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('throws on invalid refresh token', async () => {
    jwtService.verify.mockImplementation(() => { throw new Error('bad'); });

    await expect(service.refresh({ refreshToken: 'token' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('logs out with refresh token', async () => {
    await service.logout('u1', 'token');

    expect(prisma.portalSession.updateMany).toHaveBeenCalled();
  });

  it('logs out all sessions when no refresh token', async () => {
    await service.logout('u1');

    expect(prisma.portalSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1', revokedAt: null } }),
    );
  });

  it('returns success on forgot password when user missing', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    const result = await service.forgotPassword({ email: 'a@b.com' } as any);

    expect(result).toEqual({ success: true });
  });

  it('sets verification token on forgot password', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.portalUser.update.mockResolvedValue({});

    const result = await service.forgotPassword({ email: 'a@b.com' } as any);

    expect(result.token).toBeDefined();
    expect(prisma.portalUser.update).toHaveBeenCalled();
  });

  it('rejects reset password with invalid token', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    await expect(service.resetPassword({ token: 'bad', newPassword: 'pw2' } as any)).rejects.toThrow(BadRequestException);
  });

  it('resets password with valid token', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.portalUser.update.mockResolvedValue({});

    const result = await service.resetPassword({ token: 'good', newPassword: 'pw2' } as any);

    expect(result).toEqual({ success: true });
  });

  it('verifies email with valid token', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.portalUser.update.mockResolvedValue({});

    const result = await service.verifyEmail('token');

    expect(result).toEqual({ success: true });
  });

  it('throws on invalid verification token', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    await expect(service.verifyEmail('bad')).rejects.toThrow(BadRequestException);
  });

  it('registers existing portal user', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.portalUser.update.mockResolvedValue({ id: 'u1' });

    const result = await service.register('tenant-1', { email: 'a@b.com', password: 'pw' } as any);

    expect(result).toEqual({ success: true });
  });

  it('registers new portal user', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);
    prisma.portalUser.create.mockResolvedValue({ id: 'u2' });

    const result = await service.register('tenant-1', { email: 'a@b.com', password: 'pw', companyId: 'c1' } as any);

    expect(result).toEqual({ success: true });
    expect(prisma.portalUser.create).toHaveBeenCalled();
  });

  it('requires companyId for new portal user', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    await expect(service.register('tenant-1', { email: 'a@b.com', password: 'pw' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('changes password with valid current password', async () => {
    prisma.portalUser.findUnique.mockResolvedValue({ id: 'u1', password: 'old' });
    prisma.portalUser.update.mockResolvedValue({});

    const result = await service.changePassword('u1', { currentPassword: 'old', newPassword: 'new' } as any);

    expect(result).toEqual({ success: true });
  });

  it('rejects change password with invalid current password', async () => {
    prisma.portalUser.findUnique.mockResolvedValue({ id: 'u1', password: 'old' });

    await expect(service.changePassword('u1', { currentPassword: 'bad', newPassword: 'new' } as any)).rejects.toThrow(UnauthorizedException);
  });
});
