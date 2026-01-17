import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SlasService } from './slas.service';
import { PrismaService } from '../../../prisma.service';

describe('SlasService', () => {
  let service: SlasService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = { contractSLA: { findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() } };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SlasService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(SlasService);
  });

  it('lists SLAs', async () => {
    prisma.contractSLA.findMany.mockResolvedValue([]);

    const result = await service.list('tenant-1', 'c1');

    expect(result).toEqual([]);
  });

  it('creates SLA', async () => {
    prisma.contractSLA.create.mockResolvedValue({ id: 's1' });

    const result = await service.create('tenant-1', 'c1', 'user-1', { slaType: 'ON_TIME', targetPercent: 95, measurementPeriod: 'MONTH' } as any);

    expect(result.id).toBe('s1');
  });

  it('throws when SLA missing', async () => {
    prisma.contractSLA.findFirst.mockResolvedValue(null);

    await expect(service.detail('s1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('returns SLA detail', async () => {
    prisma.contractSLA.findFirst.mockResolvedValue({ id: 's1' });

    const result = await service.detail('s1', 'tenant-1');

    expect(result.id).toBe('s1');
  });

  it('emits violation', async () => {
    prisma.contractSLA.findFirst.mockResolvedValue({ id: 's1', contractId: 'c1', targetPercent: 95, status: 'ACTIVE', measurementPeriod: 'MONTH' });

    await service.performance('s1', 'tenant-1', 90);

    expect(events.emit).toHaveBeenCalledWith('sla.violation', expect.any(Object));
  });

  it('emits warning when below threshold', async () => {
    prisma.contractSLA.findFirst.mockResolvedValue({ id: 's1', contractId: 'c1', targetPercent: 95, status: 'ACTIVE', measurementPeriod: 'MONTH' });

    await service.performance('s1', 'tenant-1', 98);

    expect(events.emit).toHaveBeenCalledWith('sla.warning', expect.any(Object));
  });

  it('updates SLA', async () => {
    prisma.contractSLA.findFirst.mockResolvedValue({ id: 's1' });
    prisma.contractSLA.update.mockResolvedValue({ id: 's1', status: 'INACTIVE' });

    const result = await service.update('s1', 'tenant-1', { status: 'INACTIVE' } as any);

    expect(result.status).toBe('INACTIVE');
  });

  it('deletes SLA', async () => {
    prisma.contractSLA.findFirst.mockResolvedValue({ id: 's1' });
    prisma.contractSLA.update.mockResolvedValue({ id: 's1' });

    const result = await service.delete('s1', 'tenant-1');

    expect(result).toEqual({ success: true });
  });
});
