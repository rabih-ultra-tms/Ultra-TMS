import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FactoringVerificationsService } from './factoring-verifications.service';
import { PrismaService } from '../../../prisma.service';
import { VerificationStatusEnum } from '../dto/enums';

describe('FactoringVerificationsService', () => {
  let service: FactoringVerificationsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      factoringVerification: { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      nOARecord: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FactoringVerificationsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(FactoringVerificationsService);
  });

  it('creates verification and emits', async () => {
    prisma.nOARecord.findFirst.mockResolvedValue({ id: 'n1' });
    prisma.factoringVerification.create.mockResolvedValue({ id: 'v1' });

    const result = await service.create('t1', 'u1', { noaRecordId: 'n1', verificationDate: new Date().toISOString() } as any);

    expect(result.id).toBe('v1');
    expect(events.emit).toHaveBeenCalledWith('verification.requested', expect.any(Object));
  });

  it('lists verifications', async () => {
    prisma.factoringVerification.findMany.mockResolvedValue([]);
    prisma.factoringVerification.count.mockResolvedValue(0);

    const result = await service.findAll('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('responds to verification', async () => {
    prisma.factoringVerification.findFirst.mockResolvedValue({ id: 'v1' });
    prisma.factoringVerification.update.mockResolvedValue({ id: 'v1', verificationStatus: VerificationStatusEnum.VERIFIED });

    const result = await service.respond('t1', 'u1', 'v1', { verificationStatus: VerificationStatusEnum.VERIFIED } as any);

    expect(result.verificationStatus).toBe(VerificationStatusEnum.VERIFIED);
    expect(events.emit).toHaveBeenCalledWith('verification.responded', expect.any(Object));
  });

  it('throws when load verification missing', async () => {
    prisma.factoringVerification.findFirst.mockResolvedValue(null);

    await expect(service.getByLoad('t1', 'l1')).rejects.toThrow(NotFoundException);
  });
});
