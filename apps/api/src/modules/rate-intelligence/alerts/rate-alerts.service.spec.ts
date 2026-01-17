import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertCondition } from '@prisma/client';
import { RateAlertsService } from './rate-alerts.service';
import { PrismaService } from '../../../prisma.service';

describe('RateAlertsService', () => {
  let service: RateAlertsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      rateAlert: { findMany: jest.fn(), create: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
      rateAlertHistory: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RateAlertsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RateAlertsService);
  });

  it('lists alerts', async () => {
    prisma.rateAlert.findMany.mockResolvedValue([]);

    const result = await service.list('t1');

    expect(result).toEqual([]);
  });

  it('creates alert', async () => {
    prisma.rateAlert.create.mockResolvedValue({ id: 'a1' });

    const result = await service.create('t1', 'u1', { name: 'Lane', condition: AlertCondition.ABOVE } as any);

    expect(result.id).toBe('a1');
  });

  it('throws when updating missing alert', async () => {
    prisma.rateAlert.findFirst.mockResolvedValue(null);

    await expect(service.update('t1', 'a1', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('removes alert', async () => {
    prisma.rateAlert.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.rateAlert.update.mockResolvedValue({ id: 'a1', isActive: false });

    const result = await service.remove('t1', 'a1');

    expect(result.success).toBe(true);
  });

  it('returns alert history', async () => {
    prisma.rateAlert.findFirst.mockResolvedValue({ id: 'a1' });
    prisma.rateAlertHistory.findMany.mockResolvedValue([]);

    const result = await service.history('t1', 'a1');

    expect(result).toEqual([]);
  });
});
