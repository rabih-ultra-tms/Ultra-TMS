jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomBytes: jest.fn(() => Buffer.from('aabbccddeeff', 'hex')),
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CarrierPortalUsersService } from './carrier-portal-users.service';
import { PrismaService } from '../../../prisma.service';
import { CarrierPortalUserRole } from './types';
import { PortalUserStatus, Prisma } from '@prisma/client';

describe('CarrierPortalUsersService', () => {
  let service: CarrierPortalUsersService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      carrierPortalUser: { findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), create: jest.fn() },
      carrier: { findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CarrierPortalUsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(CarrierPortalUsersService);
  });

  it('throws when profile missing', async () => {
    prisma.carrierPortalUser.findUnique.mockResolvedValue(null);

    await expect(service.getProfile('u1')).rejects.toThrow(NotFoundException);
  });

  it('updates profile', async () => {
    prisma.carrierPortalUser.update.mockResolvedValue({ id: 'u1', firstName: 'A' });

    const result = await service.updateProfile('u1', { firstName: 'A' });

    expect(result.firstName).toBe('A');
  });

  it('throws when carrier missing', async () => {
    prisma.carrier.findUnique.mockResolvedValue(null);

    await expect(service.getCarrierInfo('c1')).rejects.toThrow(NotFoundException);
  });

  it('lists users for carrier', async () => {
    prisma.carrierPortalUser.findMany.mockResolvedValue([{ id: 'u1' }]);

    const result = await service.listUsers('c1');

    expect(prisma.carrierPortalUser.findMany).toHaveBeenCalledWith({ where: { carrierId: 'c1', deletedAt: null } });
    expect(result).toHaveLength(1);
  });

  it('blocks invite for non-admin', async () => {
    await expect(service.inviteUser('t1', 'c1', CarrierPortalUserRole.DRIVER, { email: 'a@b.com' } as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('invites user as admin', async () => {
    prisma.carrierPortalUser.create.mockResolvedValue({ id: 'u1', status: PortalUserStatus.PENDING });

    const result = await service.inviteUser('t1', 'c1', CarrierPortalUserRole.ADMIN, { email: 'a@b.com', firstName: 'A', lastName: 'B', role: CarrierPortalUserRole.DRIVER } as any);

    expect(result.id).toBe('u1');
  });

  it('invites user with permissions', async () => {
    prisma.carrierPortalUser.create.mockResolvedValue({ id: 'u2', status: PortalUserStatus.PENDING });

    await service.inviteUser('t1', 'c1', CarrierPortalUserRole.ADMIN, {
      email: 'perm@b.com',
      firstName: 'P',
      lastName: 'U',
      role: CarrierPortalUserRole.DRIVER,
      permissions: ['view-loads'],
    } as any);

    expect(prisma.carrierPortalUser.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        carrierId: 'c1',
        tenantId: 't1',
        email: 'perm@b.com',
        customFields: { permissions: ['view-loads'] },
      }),
    });
  });

  it('invites user without permissions', async () => {
    prisma.carrierPortalUser.create.mockResolvedValue({ id: 'u3', status: PortalUserStatus.PENDING });

    await service.inviteUser('t1', 'c1', CarrierPortalUserRole.ADMIN, { email: 'n@b.com', role: CarrierPortalUserRole.DRIVER } as any);

    expect(prisma.carrierPortalUser.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customFields: Prisma.JsonNull,
      }),
    });
  });

  it('rejects update for non-admin', async () => {
    await expect(service.updateUser('c1', 'u1', CarrierPortalUserRole.DRIVER, {} as any)).rejects.toThrow(ForbiddenException);
  });

  it('rejects update when user missing', async () => {
    prisma.carrierPortalUser.findUnique.mockResolvedValue(null);

    await expect(service.updateUser('c1', 'u1', CarrierPortalUserRole.ADMIN, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('rejects update when carrier mismatch', async () => {
    prisma.carrierPortalUser.findUnique.mockResolvedValue({ id: 'u1', carrierId: 'c2' });

    await expect(service.updateUser('c1', 'u1', CarrierPortalUserRole.ADMIN, {} as any)).rejects.toThrow(NotFoundException);
  });

  it('updates user permissions', async () => {
    prisma.carrierPortalUser.findUnique.mockResolvedValue({ id: 'u1', carrierId: 'c1', role: CarrierPortalUserRole.DRIVER, firstName: 'A', lastName: 'B', customFields: {} });
    prisma.carrierPortalUser.update.mockResolvedValue({ id: 'u1' });

    await service.updateUser('c1', 'u1', CarrierPortalUserRole.ADMIN, { permissions: ['loads'] } as any);

    expect(prisma.carrierPortalUser.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: expect.objectContaining({
        customFields: { permissions: ['loads'] },
      }),
    });
  });

  it('rejects deactivation for non-admin', async () => {
    await expect(service.deactivateUser('c1', 'u1', CarrierPortalUserRole.DRIVER)).rejects.toThrow(ForbiddenException);
  });

  it('rejects deactivation when user missing', async () => {
    prisma.carrierPortalUser.findUnique.mockResolvedValue(null);

    await expect(service.deactivateUser('c1', 'u1', CarrierPortalUserRole.ADMIN)).rejects.toThrow(NotFoundException);
  });

  it('deactivates user', async () => {
    prisma.carrierPortalUser.findUnique.mockResolvedValue({ id: 'u1', carrierId: 'c1' });
    prisma.carrierPortalUser.update.mockResolvedValue({ id: 'u1', status: PortalUserStatus.DEACTIVATED });

    const result = await service.deactivateUser('c1', 'u1', CarrierPortalUserRole.ADMIN);

    expect(result.status).toBe(PortalUserStatus.DEACTIVATED);
  });
});
