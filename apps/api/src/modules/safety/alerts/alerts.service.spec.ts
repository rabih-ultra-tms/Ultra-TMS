import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../../../prisma.service';

describe('Safety AlertsService', () => {
  let service: AlertsService;
  let prisma: {
    safetyAlert: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      safetyAlert: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AlertsService);
  });

  it('lists alerts with optional active filter', async () => {
    prisma.safetyAlert.findMany.mockResolvedValue([]);

    await service.list('tenant-1', true);

    expect(prisma.safetyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null, isActive: true } }),
    );
  });

  it('throws when alert not found', async () => {
    prisma.safetyAlert.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'a1')).rejects.toThrow(NotFoundException);
  });

  it('creates alert with active status', async () => {
    prisma.safetyAlert.create.mockResolvedValue({ id: 'a1' });

    await service.create('tenant-1', 'user-1', {
      carrierId: 'c1',
      alertType: 'CSA',
      alertMessage: 'Alert',
      severity: 'HIGH',
    } as any);

    expect(prisma.safetyAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          isActive: true,
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('acknowledges alert', async () => {
    prisma.safetyAlert.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.safetyAlert.update.mockResolvedValue({ id: 'a1' });

    await service.acknowledge('tenant-1', 'user-1', 'a1');

    expect(prisma.safetyAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ acknowledgedAt: expect.any(Date), acknowledgedById: 'user-1' }),
      }),
    );
  });

  it('dismisses alert', async () => {
    prisma.safetyAlert.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.safetyAlert.update.mockResolvedValue({ id: 'a1' });

    await service.dismiss('tenant-1', 'user-1', 'a1');

    expect(prisma.safetyAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: false, resolvedAt: expect.any(Date), resolvedById: 'user-1' }),
      }),
    );
  });

  it('resolves alert with notes', async () => {
    prisma.safetyAlert.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.safetyAlert.update.mockResolvedValue({ id: 'a1' });

    await service.resolve('tenant-1', 'user-1', 'a1', { resolutionNotes: 'done' } as any);

    expect(prisma.safetyAlert.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ resolutionNotes: 'done' }),
      }),
    );
  });
});