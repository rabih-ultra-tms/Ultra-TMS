import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma.service';

jest.mock('bcrypt');

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), update: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ProfileService);
  });

  it('returns profile data', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });

    const result = await service.getProfile('u1');

    expect(result.data).toEqual({ id: 'u1' });
  });

  it('throws when profile missing', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getProfile('u1')).rejects.toThrow(NotFoundException);
  });

  it('updates profile', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    prisma.user.update.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });

    const result = await service.updateProfile('u1', { firstName: 'New' });

    expect(result.message).toBe('Profile updated successfully');
  });

  it('changes password when current matches', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    prisma.user.update.mockResolvedValue({});

    const result = await service.changePassword('u1', 'old', 'new');

    expect(result.data.success).toBe(true);
  });

  it('rejects invalid current password', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', passwordHash: 'hash' });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.changePassword('u1', 'bad', 'new')).rejects.toThrow(BadRequestException);
  });

  it('updates avatar', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    prisma.user.update.mockResolvedValue({ avatarUrl: 'url' });

    const result = await service.updateAvatar('u1', 'url');

    expect(result.data.avatarUrl).toBe('url');
  });
});
