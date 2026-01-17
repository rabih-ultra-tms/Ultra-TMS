jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(() => Buffer.from('aabbccddeeff', 'hex')),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PortalUserRole, PortalUserStatus } from '@prisma/client';
import { PortalUsersService } from './portal-users.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalUsersService', () => {
  let service: PortalUsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      portalUser: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalUsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PortalUsersService);
  });

  it('returns profile', async () => {
    prisma.portalUser.findUnique.mockResolvedValue({ id: 'u1' });

    const result = await service.profile('u1');

    expect(result?.id).toBe('u1');
  });

  it('updates profile', async () => {
    prisma.portalUser.update.mockResolvedValue({ id: 'u1', firstName: 'A' });

    const result = await service.updateProfile('u1', { firstName: 'A' });

    expect(result.firstName).toBe('A');
  });

  it('lists users', async () => {
    prisma.portalUser.findMany.mockResolvedValue([]);

    const result = await service.list('t1', 'c1');

    expect(result).toEqual([]);
  });

  it('invites user and returns token', async () => {
    prisma.portalUser.create.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: PortalUserRole.USER, status: PortalUserStatus.PENDING });

    const result = await service.invite('t1', 'c1', 'inviter', { email: 'a@b.com', firstName: 'A', lastName: 'B' } as any);

    expect(result.invitationToken).toBeDefined();
  });

  it('invites user with explicit role and permissions', async () => {
    prisma.portalUser.create.mockResolvedValue({ id: 'u2', email: 'b@b.com', role: PortalUserRole.ADMIN, status: PortalUserStatus.PENDING });

    const result = await service.invite('t1', 'c1', 'inviter', {
      email: 'b@b.com',
      firstName: 'B',
      lastName: 'C',
      role: PortalUserRole.ADMIN,
      permissions: ['READ'],
    } as any);

    expect(result.role).toBe(PortalUserRole.ADMIN);
    expect(prisma.portalUser.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ customFields: { permissions: ['READ'] } }) }),
    );
  });

  it('throws when updating missing user', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    await expect(service.updateUser('t1', 'c1', 'u1', { firstName: 'A' } as any)).rejects.toThrow(NotFoundException);
  });

  it('updates user and permissions', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1', role: PortalUserRole.USER, firstName: 'A', lastName: 'B', customFields: { foo: 'bar' } });
    prisma.portalUser.update.mockResolvedValue({ id: 'u1', role: PortalUserRole.ADMIN, customFields: { foo: 'bar', permissions: ['WRITE'] } });

    const result = await service.updateUser('t1', 'c1', 'u1', { role: PortalUserRole.ADMIN, permissions: ['WRITE'] } as any);

    expect(result.role).toBe(PortalUserRole.ADMIN);
    expect(prisma.portalUser.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: PortalUserRole.ADMIN }) }),
    );
  });

  it('deactivates user', async () => {
    prisma.portalUser.findFirst.mockResolvedValue({ id: 'u1' });
    prisma.portalUser.update.mockResolvedValue({ id: 'u1', status: PortalUserStatus.DEACTIVATED });

    const result = await service.deactivate('t1', 'c1', 'u1');

    expect(result.status).toBe(PortalUserStatus.DEACTIVATED);
  });

  it('throws when deactivating missing user', async () => {
    prisma.portalUser.findFirst.mockResolvedValue(null);

    await expect(service.deactivate('t1', 'c1', 'u1')).rejects.toThrow(NotFoundException);
  });
});
