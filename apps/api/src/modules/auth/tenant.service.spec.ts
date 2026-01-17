import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { PrismaService } from '../../prisma.service';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { tenant: { findUnique: jest.fn(), update: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TenantService);
  });

  it('returns tenant', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });

    const result = await service.getTenant('t1');

    expect(result.data).toEqual({ id: 't1' });
  });

  it('throws when tenant missing', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(service.getTenant('t1')).rejects.toThrow(NotFoundException);
  });

  it('updates tenant settings', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
    prisma.tenant.update.mockResolvedValue({ settings: { a: 1 }, features: { b: 2 } });

    const result = await service.updateSettings('t1', 'u1', { a: 1 }, { b: 2 });

    expect(result.data.settings).toEqual({ a: 1 });
  });

  it('updates tenant info', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
    prisma.tenant.update.mockResolvedValue({ id: 't1', name: 'New', domain: 'new.com' });

    const result = await service.updateTenant('t1', 'u1', { name: 'New', domain: 'new.com' });

    expect(result.data).toEqual({ id: 't1', name: 'New', domain: 'new.com' });
    expect(prisma.tenant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
        data: expect.objectContaining({ name: 'New', domain: 'new.com', updatedById: 'u1' }),
      }),
    );
  });

  it('throws when updating missing tenant', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(service.updateTenant('t1', 'u1', { name: 'New' })).rejects.toThrow(NotFoundException);
  });

  it('returns tenant settings and features', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1', settings: { a: 1 }, features: { b: true } });

    const result = await service.getSettings('t1');

    expect(result.data).toEqual({ settings: { a: 1 }, features: { b: true } });
  });

  it('throws when tenant missing for settings', async () => {
    prisma.tenant.findUnique.mockResolvedValue(null);

    await expect(service.getSettings('t1')).rejects.toThrow(NotFoundException);
  });

  it('updates settings without features', async () => {
    prisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
    prisma.tenant.update.mockResolvedValue({ settings: { theme: 'dark' }, features: { x: 1 } });

    const result = await service.updateSettings('t1', 'u1', { theme: 'dark' });

    expect(result.data.settings).toEqual({ theme: 'dark' });
    expect(prisma.tenant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ settings: { theme: 'dark' }, updatedById: 'u1' }),
      }),
    );
  });
});
