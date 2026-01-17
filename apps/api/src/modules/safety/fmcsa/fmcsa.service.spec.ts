import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FmcsaService } from './fmcsa.service';
import { FmcsaApiClient } from './fmcsa-api.client';
import { PrismaService } from '../../../prisma.service';

describe('FmcsaService', () => {
  let service: FmcsaService;
  let prisma: any;
  let events: { emit: jest.Mock };
  let apiClient: { fetchCarrierData: jest.Mock };

  beforeEach(async () => {
    prisma = {
      fmcsaCarrierRecord: { findFirst: jest.fn(), upsert: jest.fn(), update: jest.fn() },
      carrier: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };
    apiClient = { fetchCarrierData: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FmcsaService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
        { provide: FmcsaApiClient, useValue: apiClient },
      ],
    }).compile();

    service = module.get(FmcsaService);
  });

  it('returns cached record on lookup', async () => {
    prisma.fmcsaCarrierRecord.findFirst.mockResolvedValue({ id: 'r1' });

    const result = await service.lookup('tenant-1', { dotNumber: '123' } as any);

    expect(result).toEqual({ id: 'r1' });
    expect(apiClient.fetchCarrierData).not.toHaveBeenCalled();
  });

  it('looks up and upserts when no cache', async () => {
    prisma.fmcsaCarrierRecord.findFirst.mockResolvedValue(null);
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1', dotNumber: '123', legalName: 'Carrier' });
    apiClient.fetchCarrierData.mockResolvedValue({ dotNumber: '123', legalName: 'FMCSA' });
    prisma.fmcsaCarrierRecord.upsert.mockResolvedValue({ id: 'r1' });

    const result = await service.lookup('tenant-1', { dotNumber: '123' } as any);

    expect(prisma.fmcsaCarrierRecord.upsert).toHaveBeenCalled();
    expect(result).toEqual({ id: 'r1' });
  });

  it('throws when no carrier found for lookup', async () => {
    prisma.fmcsaCarrierRecord.findFirst.mockResolvedValue(null);
    prisma.carrier.findFirst.mockResolvedValue(null);

    await expect(service.lookup('tenant-1', { dotNumber: '123' } as any)).rejects.toThrow(NotFoundException);
  });

  it('verifies carrier and emits event', async () => {
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1', legalName: 'Carrier' });
    prisma.fmcsaCarrierRecord.upsert.mockResolvedValue({ id: 'r1', operatingStatus: 'ACTIVE' });

    const result = await service.verify('tenant-1', 'c1');

    expect(result).toEqual({ id: 'r1', operatingStatus: 'ACTIVE' });
    expect(events.emit).toHaveBeenCalledWith('safety.carrier.verified', { carrierId: 'c1', status: 'ACTIVE' });
  });

  it('refreshes an existing record', async () => {
    prisma.fmcsaCarrierRecord.findFirst.mockResolvedValue({ id: 'r1', saferDataJson: null });
    prisma.fmcsaCarrierRecord.update.mockResolvedValue({ id: 'r1' });

    const result = await service.refresh('tenant-1', 'c1');

    expect(prisma.fmcsaCarrierRecord.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 'r1' });
  });

  it('throws when record missing', async () => {
    prisma.fmcsaCarrierRecord.findFirst.mockResolvedValue(null);

    await expect(service.getRecord('tenant-1', 'c1')).rejects.toThrow(NotFoundException);
  });
});
