import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { PrismaService } from '../../../prisma.service';

describe('Safety IncidentsService', () => {
  let service: IncidentsService;
  let prisma: {
    safetyIncident: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    carrier: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      safetyIncident: {
        findMany: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      carrier: { findFirst: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(IncidentsService);
  });

  it('lists incidents with filters', async () => {
    prisma.safetyIncident.findMany.mockResolvedValue([]);

    await service.list('tenant-1', { carrierId: 'c1', severity: 'HIGH' } as any);

    expect(prisma.safetyIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null, carrierId: 'c1', severity: 'HIGH' }),
      }),
    );
  });

  it('throws when carrier missing on create', async () => {
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(
      service.create('tenant-1', 'user-1', { carrierId: 'c1' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates incident when carrier exists', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.safetyIncident.create.mockResolvedValue({ id: 'i1' });

    await service.create('tenant-1', 'user-1', {
      carrierId: 'c1',
      incidentType: 'ACCIDENT',
      incidentDate: new Date('2025-01-01'),
      location: 'Dallas',
      description: 'Desc',
      severity: 'HIGH',
    } as any);

    expect(prisma.safetyIncident.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdById: 'user-1', updatedById: 'user-1' }),
      }),
    );
  });

  it('throws when incident not found', async () => {
    prisma.safetyIncident.findFirst.mockResolvedValue(null);

    await expect(service.get('tenant-1', 'i1')).rejects.toThrow(NotFoundException);
  });

  it('updates incident', async () => {
    prisma.safetyIncident.findFirst.mockResolvedValue({ id: 'i1' });
    prisma.safetyIncident.update.mockResolvedValue({ id: 'i1' });

    await service.update('tenant-1', 'user-1', 'i1', { description: 'Updated' } as any);

    expect(prisma.safetyIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ description: 'Updated', updatedById: 'user-1' }) }),
    );
  });

  it('closes incident and updates custom fields', async () => {
    prisma.safetyIncident.findFirst.mockResolvedValue({ id: 'i1', customFields: {} });
    prisma.safetyIncident.update.mockResolvedValue({ id: 'i1' });

    await service.close('tenant-1', 'user-1', 'i1', { resolutionNotes: 'done' } as any);

    expect(prisma.safetyIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ updatedById: 'user-1' }),
      }),
    );
  });

  it('returns violations list', async () => {
    prisma.safetyIncident.findFirst.mockResolvedValue({ id: 'i1', violationCodes: ['V1'] });

    const result = await service.violations('tenant-1', 'i1');

    expect(result).toEqual({ violations: ['V1'] });
  });
});