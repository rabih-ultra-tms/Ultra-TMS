jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(() => Buffer.from('aabbccddeeff0011', 'hex')),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PortalUserStatus } from '@prisma/client';
import { CarrierPortalAuthService } from './carrier-portal-auth.service';
import { PrismaService } from '../../../prisma.service';

describe('CarrierPortalAuthService', () => {
  let service: CarrierPortalAuthService;
  let prisma: any;
  let jwt: { sign: jest.Mock; verify: jest.Mock };

  beforeEach(async () => {
    prisma = {
      carrierPortalUser: { findFirst: jest.fn(), update: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      carrierPortalSession: { create: jest.fn(), updateMany: jest.fn(), findFirst: jest.fn() },
    };
    jwt = { sign: jest.fn(), verify: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalAuthService, { provide: PrismaService, useValue: prisma }, { provide: JwtService, useValue: jwt }],
    }).compile();

    service = module.get(CarrierPortalAuthService);
  });

  it('rejects invalid credentials', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue(null);

    await expect(service.login({ email: 'a@b.com', password: 'bad' } as any, {})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects suspended user', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue({ id: 'u1', password: 'pw', status: PortalUserStatus.SUSPENDED });

    await expect(service.login({ email: 'a@b.com', password: 'pw' } as any, {})).rejects.toThrow(UnauthorizedException);
  });

  it('logs in and creates session', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue({ id: 'u1', tenantId: 't1', carrierId: 'c1', role: 'USER', password: 'pw', status: PortalUserStatus.ACTIVE });
    jwt.sign.mockReturnValueOnce('access').mockReturnValueOnce('refresh');
    prisma.carrierPortalSession.create.mockResolvedValue({ id: 's1' });
    prisma.carrierPortalUser.update.mockResolvedValue({ id: 'u1' });

    const result = await service.login({ email: 'a@b.com', password: 'pw' } as any, { userAgent: 'ua' });

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
  });

  it('refreshes token', async () => {
    jwt.verify.mockReturnValue({ sub: 'u1', tenantId: 't1', type: 'refresh' });
    prisma.carrierPortalSession.findFirst.mockResolvedValue({ id: 's1', expiresAt: new Date(Date.now() + 1000) });
    prisma.carrierPortalUser.findUnique.mockResolvedValue({ id: 'u1', tenantId: 't1', carrierId: 'c1', role: 'USER' });
    jwt.sign.mockReturnValue('new-access');

    const result = await service.refresh({ refreshToken: 'rt' } as any);

    expect(result.accessToken).toBe('new-access');
  });

  it('rejects refresh with invalid token', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('bad'); });

    await expect(service.refresh({ refreshToken: 'rt' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('logs out current session', async () => {
    prisma.carrierPortalSession.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.logout('u1', 'rt');

    expect(result.success).toBe(true);
  });

  it('forgot password returns success if user missing', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue(null);

    const result = await service.forgotPassword({ email: 'a@b.com' } as any);

    expect(result.success).toBe(true);
  });

  it('reset password rejects invalid token', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue(null);

    await expect(service.resetPassword({ token: 't', newPassword: 'p' } as any)).rejects.toThrow(BadRequestException);
  });

  it('verify email rejects invalid token', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue(null);

    await expect(service.verifyEmail('t')).rejects.toThrow(BadRequestException);
  });

  it('register updates existing user', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue({ id: 'u1', firstName: 'Old', lastName: 'User', carrierId: 'c1' });
    prisma.carrierPortalUser.update.mockResolvedValue({ id: 'u1' });

    const result = await service.register('t1', { email: 'a@b.com', password: 'pw' } as any);

    expect(result.success).toBe(true);
  });

  it('register requires carrierId for new user', async () => {
    prisma.carrierPortalUser.findFirst.mockResolvedValue(null);

    await expect(service.register('t1', { email: 'a@b.com', password: 'pw' } as any)).rejects.toThrow(BadRequestException);
  });
});
