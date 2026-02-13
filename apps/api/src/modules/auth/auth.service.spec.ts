import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findFirst: jest.Mock; update: jest.Mock; findUnique?: jest.Mock; updateMany?: jest.Mock; findMany?: jest.Mock };
    passwordResetToken: { create: jest.Mock; findFirst?: jest.Mock; update?: jest.Mock };
    session?: { deleteMany: jest.Mock; findUnique?: jest.Mock; create?: jest.Mock };
    $transaction?: jest.Mock;
  };
  let redisService: {
    isAccountLocked: jest.Mock;
    resetLoginAttempts: jest.Mock;
    storePasswordResetToken: jest.Mock;
    getSession?: jest.Mock;
    consumePasswordResetToken?: jest.Mock;
    revokeSession?: jest.Mock;
    revokeAllUserSessions?: jest.Mock;
    incrementLoginAttempts?: jest.Mock;
    lockAccount?: jest.Mock;
    consumeEmailVerificationToken?: jest.Mock;
  };
  const jwtService = { verify: jest.fn(), sign: jest.fn() };
  const configService = { get: jest.fn((key: string, def?: string) => def) };
  const emailService = { sendPasswordReset: jest.fn() };

  beforeEach(async () => {
    prisma = {
      user: { findFirst: jest.fn(), update: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn(), findMany: jest.fn() },
      passwordResetToken: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      session: { deleteMany: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    redisService = {
      isAccountLocked: jest.fn(),
      resetLoginAttempts: jest.fn(),
      storePasswordResetToken: jest.fn(),
      getSession: jest.fn(),
      consumePasswordResetToken: jest.fn(),
      revokeSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
      incrementLoginAttempts: jest.fn().mockResolvedValue(1),
      lockAccount: jest.fn(),
      consumeEmailVerificationToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: RedisService, useValue: redisService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('rejects login without tenantId for non-superadmin', async () => {
    prisma.user.findMany?.mockResolvedValue([]);

    await expect(
      service.login({ email: 'a@b.com', password: 'x' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('allows login without tenantId for superadmin', async () => {
    redisService.isAccountLocked.mockResolvedValue(false);
    prisma.user.findMany?.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@b.com',
        tenantId: 't1',
        roleId: 'r1',
        firstName: 'A',
        lastName: 'B',
        status: 'ACTIVE',
        deletedAt: null,
        passwordHash: 'hash',
        role: { name: 'SUPER_ADMIN' },
      },
    ]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.user.update.mockResolvedValue({ id: 'u1' });
    jest.spyOn(service as any, 'generateTokenPair').mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 3600,
    });

    const result = await service.login({ email: 'a@b.com', password: 'pw' } as any);

    expect(result.accessToken).toBe('access');
    expect(redisService.resetLoginAttempts).toHaveBeenCalled();
  });

  it('rejects login when account locked', async () => {
    redisService.isAccountLocked.mockResolvedValue(true);

    await expect(
      service.login({ email: 'a@b.com', password: 'x', tenantId: 't1' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('forgotPassword returns silently when user not found', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await service.forgotPassword({ email: 'missing@x.com' });

    expect(emailService.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('increments attempts when user not found on login', async () => {
    redisService.isAccountLocked.mockResolvedValue(false);
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@x.com', password: 'pw', tenantId: 't1' } as any),
    ).rejects.toThrow(UnauthorizedException);

    expect(redisService.incrementLoginAttempts).toHaveBeenCalledWith('missing@x.com');
  });

  it('locks account after max attempts', async () => {
    redisService.isAccountLocked.mockResolvedValue(false);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      tenantId: 't1',
      status: 'ACTIVE',
      deletedAt: null,
      passwordHash: 'hash',
      role: { name: 'ADMIN' },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    redisService.incrementLoginAttempts?.mockResolvedValue(5);

    await expect(
      service.login({ email: 'a@b.com', password: 'bad', tenantId: 't1' } as any),
    ).rejects.toThrow(UnauthorizedException);

    expect(redisService.lockAccount).toHaveBeenCalled();
    expect(prisma.user.updateMany).toHaveBeenCalled();
  });

  it('logs in and returns tokens', async () => {
    redisService.isAccountLocked.mockResolvedValue(false);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      tenantId: 't1',
      roleId: 'r1',
      firstName: 'A',
      lastName: 'B',
      status: 'ACTIVE',
      deletedAt: null,
      passwordHash: 'hash',
      role: { name: 'ADMIN' },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prisma.user.update.mockResolvedValue({ id: 'u1' });
    jest.spyOn(service as any, 'generateTokenPair').mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresIn: 3600,
    });

    const result = await service.login({ email: 'a@b.com', password: 'pw', tenantId: 't1' } as any);

    expect(result.accessToken).toBe('access');
    expect(redisService.resetLoginAttempts).toHaveBeenCalled();
  });

  it('rejects login on invalid password', async () => {
    redisService.isAccountLocked.mockResolvedValue(false);
    prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      tenantId: 't1',
      status: 'ACTIVE',
      deletedAt: null,
      passwordHash: 'hash',
      role: { name: 'ADMIN' },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: 'a@b.com', password: 'bad', tenantId: 't1' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('forgotPassword stores token and sends email', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', email: 'a@b.com', firstName: 'A' });
    prisma.passwordResetToken.create.mockResolvedValue({ id: 'prt-1' });
    redisService.storePasswordResetToken.mockResolvedValue(undefined);

    await service.forgotPassword({ email: 'a@b.com' } as any);

    expect(prisma.passwordResetToken.create).toHaveBeenCalled();
    expect(emailService.sendPasswordReset).toHaveBeenCalled();
  });

  it('refresh rejects invalid token', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(service.refresh({ refreshToken: 'bad' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('refresh rejects wrong token type', async () => {
    jwtService.verify.mockReturnValue({ type: 'access' });

    await expect(service.refresh({ refreshToken: 'token' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('refresh rejects missing session data', async () => {
    jwtService.verify.mockReturnValue({ type: 'refresh', sub: 'u1', jti: 's1' });
    redisService.getSession?.mockResolvedValue(null);
    prisma.session?.findUnique?.mockResolvedValue(null);

    await expect(service.refresh({ refreshToken: 'token' } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('refresh rejects when token hash mismatches', async () => {
    jwtService.verify.mockReturnValue({ type: 'refresh', sub: 'u1', jti: 's1' });
    redisService.getSession?.mockResolvedValue({ refreshTokenHash: 'hash1' });
    prisma.session?.findUnique?.mockResolvedValue({ id: 's1', userId: 'u1', refreshTokenHash: 'hash1', expiresAt: new Date(Date.now() + 1000) });
    const hashSpy = jest.spyOn(service as any, 'hashToken').mockReturnValue('other-hash');

    await expect(service.refresh({ refreshToken: 'token' } as any)).rejects.toThrow(UnauthorizedException);

    hashSpy.mockRestore();
  });

  it('refresh returns new token pair for valid session', async () => {
    const tokenHash = (service as any).hashToken('refresh');
    jwtService.verify.mockReturnValue({
      type: 'refresh',
      sub: 'u1',
      jti: 's1',
      userAgent: 'agent',
      ipAddress: '127.0.0.1',
    });
    redisService.getSession?.mockResolvedValue({ refreshTokenHash: tokenHash });
    prisma.session?.findUnique?.mockResolvedValue({ id: 's1', userId: 'u1', refreshTokenHash: tokenHash, expiresAt: new Date(Date.now() + 1000) });
    prisma.user.findUnique?.mockResolvedValue({ id: 'u1', email: 'a@b.com', tenantId: 't1', roleId: 'r1', status: 'ACTIVE', deletedAt: null, role: { name: 'ADMIN' } });
    jest.spyOn(service as any, 'generateTokenPair').mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: 1 });

    const result = await service.refresh({ refreshToken: 'refresh' } as any);

    expect(result.refreshToken).toBe('r');
  });

  it('logout revokes session', async () => {
    await service.logout('u1', 's1');

    expect(redisService.revokeSession).toHaveBeenCalledWith('u1', 's1');
    expect(prisma.session?.deleteMany).toHaveBeenCalled();
  });

  it('logoutAll revokes all sessions', async () => {
    await service.logoutAll('u1');

    expect(redisService.revokeAllUserSessions).toHaveBeenCalledWith('u1');
    expect(prisma.session?.deleteMany).toHaveBeenCalled();
  });

  it('resetPassword rejects invalid token', async () => {
    prisma.passwordResetToken.findFirst?.mockResolvedValue(null);

    await expect(service.resetPassword({ token: 'bad', newPassword: 'pw' } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('resetPassword updates password and revokes sessions', async () => {
    prisma.passwordResetToken.findFirst?.mockResolvedValue({
      id: 'prt1',
      userId: 'u1',
      user: { id: 'u1' },
    });
    redisService.consumePasswordResetToken?.mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    prisma.$transaction?.mockResolvedValue([]);

    await service.resetPassword({ token: 'tok', newPassword: 'pw' } as any);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(redisService.revokeAllUserSessions).toHaveBeenCalledWith('u1');
  });

  it('verifyEmail rejects invalid token', async () => {
    prisma.user.findMany?.mockResolvedValue([{ id: 'u1' }]);
    redisService.consumeEmailVerificationToken?.mockResolvedValue(false);

    await expect(service.verifyEmail({ token: 'tok' } as any)).rejects.toThrow(BadRequestException);
  });

  it('verifyEmail marks user as verified', async () => {
    prisma.user.findMany?.mockResolvedValue([{ id: 'u1' }]);
    redisService.consumeEmailVerificationToken?.mockResolvedValue(true);

    await service.verifyEmail({ token: 'tok' } as any);

    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('getMe throws when user missing', async () => {
    prisma.user.findUnique?.mockResolvedValue(null);

    await expect(service.getMe('u1')).rejects.toThrow(NotFoundException);
  });

  it('getMe returns user without password hash', async () => {
    prisma.user.findUnique?.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      status: 'ACTIVE',
      passwordHash: 'secret',
      tenant: { id: 't1', name: 'Tenant' },
      role: { id: 'r1', name: 'Admin', permissions: [] },
    });

    const result = await service.getMe('u1');

    expect((result as any).passwordHash).toBeUndefined();
    expect(result.id).toBe('u1');
  });
});
