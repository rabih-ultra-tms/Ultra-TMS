import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, QuoteRequestStatus } from '@prisma/client';
import { PortalQuotesService } from './portal-quotes.service';
import { PrismaService } from '../../../prisma.service';

describe('PortalQuotesService', () => {
  let service: PortalQuotesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      quoteRequest: {
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PortalQuotesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(PortalQuotesService);
  });

  it('lists quotes', async () => {
    prisma.quoteRequest.findMany.mockResolvedValue([]);

    const result = await service.list('t1', 'c1', 'u1');

    expect(result).toEqual([]);
  });

  it('throws when detail missing', async () => {
    prisma.quoteRequest.findFirst.mockResolvedValue(null);

    await expect(service.detail('t1', 'c1', 'q1')).rejects.toThrow(NotFoundException);
  });

  it('submits request', async () => {
    prisma.quoteRequest.count.mockResolvedValue(0);
    prisma.quoteRequest.create.mockResolvedValue({ id: 'q1' });

    const result = await service.submit('t1', 'c1', 'u1', {
      originCity: 'A',
      originState: 'TX',
      originZip: '00000',
      destCity: 'B',
      destState: 'CA',
      destZip: '11111',
      pickupDate: '2025-01-01',
      equipmentType: 'VAN',
    } as any);

    expect(result.id).toBe('q1');
  });

  it('accepts quote when status is SUBMITTED', async () => {
    prisma.quoteRequest.findFirst.mockResolvedValue({ id: 'q1', status: QuoteRequestStatus.SUBMITTED, customFields: Prisma.JsonNull });
    prisma.quoteRequest.update.mockResolvedValue({ id: 'q1', status: QuoteRequestStatus.ACCEPTED });

    const result = await service.accept('t1', 'c1', 'q1', { notes: 'ok' } as any);

    expect(result.status).toBe(QuoteRequestStatus.ACCEPTED);
  });

  it('rejects accept when invalid status', async () => {
    prisma.quoteRequest.findFirst.mockResolvedValue({ id: 'q1', status: QuoteRequestStatus.ACCEPTED });

    await expect(service.accept('t1', 'c1', 'q1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('declines quote', async () => {
    prisma.quoteRequest.findFirst.mockResolvedValue({ id: 'q1' });
    prisma.quoteRequest.update.mockResolvedValue({ id: 'q1', status: QuoteRequestStatus.DECLINED });

    const result = await service.decline('t1', 'c1', 'q1', { reason: 'no' } as any);

    expect(result.status).toBe(QuoteRequestStatus.DECLINED);
  });

  it('adds revision request', async () => {
    prisma.quoteRequest.findFirst.mockResolvedValue({ id: 'q1', customFields: {} });
    prisma.quoteRequest.update.mockResolvedValue({ id: 'q1', status: QuoteRequestStatus.REVIEWING });

    const result = await service.revision('t1', 'c1', 'q1', { request: 'update' } as any);

    expect(result.status).toBe(QuoteRequestStatus.REVIEWING);
  });

  it('estimates quote', async () => {
    const result = await service.estimate('t1', 'c1', 'u1', { originCity: 'A', destCity: 'B' } as any);

    expect(result.estimatedRate).toBeGreaterThan(0);
  });
});
