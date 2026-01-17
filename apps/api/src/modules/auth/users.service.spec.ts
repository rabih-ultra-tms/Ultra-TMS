import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma.service';
import { EmailService } from '../email/email.service';

jest.mock('bcrypt');
jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(() => Buffer.from('token')),
  };
});

describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;
  let emailService: { sendInvitation: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      passwordResetToken: { create: jest.fn() },
    };
    emailService = { sendInvitation: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('returns users with pagination', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 'u1', passwordHash: 'hash' }]);
    prisma.user.count.mockResolvedValue(1);

    const result = await service.findAll('tenant-1');

    expect(result.total).toBe(1);
  });

  it('throws on missing user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('prevents duplicate user creation', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });

    await expect(service.create('tenant-1', 'admin', { email: 'a@b.com', password: 'pw' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  it('creates user with hashed password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });

    await service.create('tenant-1', 'admin', { email: 'a@b.com', password: 'pw' } as any);

    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('updates user and hashes password when provided', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.user.update.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });

    await service.update('tenant-1', 'u1', 'admin', { password: 'new' } as any);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ passwordHash: 'hash' }) }),
    );
  });

  it('increments failed attempts and locks account', async () => {
    prisma.user.update.mockResolvedValue({ failedLoginAttempts: 5 });

    await service.incrementFailedAttempts('u1');

    expect(prisma.user.update).toHaveBeenCalledTimes(2);
  });

  it('invites user and sends email', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', status: 'INVITED', email: 'a@b.com', firstName: 'A' });
    prisma.passwordResetToken.create.mockResolvedValue({ id: 't1' });

    await service.inviteUser('tenant-1', 'u1', { firstName: 'Inv', lastName: 'iter' } as any);

    expect(emailService.sendInvitation).toHaveBeenCalled();
  });

  it('throws when invite status invalid', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', status: 'ACTIVE' });

    await expect(service.inviteUser('tenant-1', 'u1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('deletes user via soft delete', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.user.update.mockResolvedValue({ id: 'u1' });

    const result = await service.delete('tenant-1', 'u1', 'admin');

    expect(result.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
    );
  });

  it('activates user', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', status: 'INVITED' });
    prisma.user.update.mockResolvedValue({ id: 'u1', status: 'ACTIVE' });

    const result = await service.activateUser('tenant-1', 'u1', 'admin');

    expect(result.data.status).toBe('ACTIVE');
  });

  it('deactivates user', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'u1', status: 'ACTIVE' });
    prisma.user.update.mockResolvedValue({ id: 'u1', status: 'INACTIVE' });

    const result = await service.deactivateUser('tenant-1', 'u1', 'admin');

    expect(result.data.status).toBe('INACTIVE');
  });

  it('validates password via bcrypt', async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validatePassword({ passwordHash: 'hash' }, 'pw');

    expect(result).toBe(true);
  });

  it('updates last login', async () => {
    prisma.user.update.mockResolvedValue({ id: 'u1' });

    await service.updateLastLogin('u1');

    expect(prisma.user.update).toHaveBeenCalled();
  });
});
