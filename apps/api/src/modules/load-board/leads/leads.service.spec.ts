import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostLeadStatus } from '@prisma/client';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../../prisma.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      postLead: { findMany: jest.fn(), count: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      carrier: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(LeadsService);
  });

  it('lists leads', async () => {
    prisma.postLead.findMany.mockResolvedValue([]);
    prisma.postLead.count.mockResolvedValue(0);

    const result = await service.list('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('throws when lead missing', async () => {
    prisma.postLead.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'l1')).rejects.toThrow(NotFoundException);
  });

  it('qualifies lead and emits', async () => {
    prisma.postLead.findFirst.mockResolvedValue({ id: 'l1', carrierId: 'c1' });
    prisma.postLead.update.mockResolvedValue({ id: 'l1', status: PostLeadStatus.QUOTED, carrierId: 'c1' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });

    const result = await service.qualify('t1', 'l1', { carrierId: 'c1' } as any);

    expect(result.status).toBe(PostLeadStatus.QUOTED);
    expect(events.emit).toHaveBeenCalledWith('loadboard.lead.qualified', expect.any(Object));
  });

  it('converts lead and emits', async () => {
    prisma.postLead.findFirst.mockResolvedValue({ id: 'l1', carrierId: 'c1' });
    prisma.postLead.update.mockResolvedValue({ id: 'l1', status: PostLeadStatus.ACCEPTED, carrierId: 'c1' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });

    const result = await service.convert('t1', 'l1', { carrierId: 'c1' } as any);

    expect(result.status).toBe(PostLeadStatus.ACCEPTED);
    expect(events.emit).toHaveBeenCalledWith('loadboard.lead.converted', expect.any(Object));
  });

  it('updates lead with contact info', async () => {
    prisma.postLead.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.postLead.update.mockResolvedValue({ id: 'l1', status: PostLeadStatus.CONTACTED });

    const result = await service.contact('t1', 'l1', { contactedBy: 'u1' } as any);

    expect(result.status).toBe(PostLeadStatus.CONTACTED);
  });

  it('assigns lead to user', async () => {
    prisma.postLead.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.postLead.update.mockResolvedValue({ id: 'l1' });

    await service.assign('t1', 'l1', { assigneeId: 'u2' } as any);

    expect(prisma.postLead.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ customFields: { assignedTo: 'u2' } }) }),
    );
  });

  it('updates lead status', async () => {
    prisma.postLead.findFirst.mockResolvedValue({ id: 'l1' });
    prisma.postLead.update.mockResolvedValue({ id: 'l1', status: PostLeadStatus.DECLINED });

    const result = await service.update('t1', 'l1', { status: PostLeadStatus.DECLINED } as any);

    expect(result.status).toBe(PostLeadStatus.DECLINED);
  });

  it('qualifies lead by matching carrier', async () => {
    prisma.postLead.findFirst.mockResolvedValue({ id: 'l1', carrierMC: 'MC1' });
    prisma.carrier.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.postLead.update.mockResolvedValue({ id: 'l1', status: PostLeadStatus.QUOTED, carrierId: 'c1' });

    const result = await service.qualify('t1', 'l1', {} as any);

    expect(result.carrierId).toBe('c1');
  });
});
