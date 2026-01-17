import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EdiDocumentsService } from './edi-documents.service';
import { PrismaService } from '../../../prisma.service';
import { EdiParserService } from '../parsing/edi-parser.service';
import { EdiControlNumberService } from '../control-number.service';

describe('EdiDocumentsService', () => {
  let service: EdiDocumentsService;
  let prisma: any;
  let events: { emit: jest.Mock };
  let parser: { parse: jest.Mock };
  let controlNumbers: { nextTriple: jest.Mock };

  beforeEach(async () => {
    prisma = {
      ediMessage: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      ediAcknowledgment: { create: jest.fn() },
    };
    events = { emit: jest.fn() };
    parser = { parse: jest.fn() };
    controlNumbers = { nextTriple: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdiDocumentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
        { provide: EdiParserService, useValue: parser },
        { provide: EdiControlNumberService, useValue: controlNumbers },
      ],
    }).compile();

    service = module.get(EdiDocumentsService);
  });

  it('lists EDI documents', async () => {
    prisma.ediMessage.findMany.mockResolvedValue([]);
    prisma.ediMessage.count.mockResolvedValue(0);

    await service.list('tenant-1', {} as any);

    expect(prisma.ediMessage.findMany).toHaveBeenCalled();
  });

  it('throws when message missing', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'm1')).rejects.toThrow(NotFoundException);
  });

  it('imports document and emits events', async () => {
    controlNumbers.nextTriple.mockResolvedValue({ isaControlNumber: '1', gsControlNumber: '2', stControlNumber: '3' });
    parser.parse.mockReturnValue({ loadId: 'l1' });
    prisma.ediMessage.create.mockResolvedValue({ id: 'm1', entityId: 'l1' });

    await service.importDocument('tenant-1', 'user-1', { transactionType: 'EDI_204', tradingPartnerId: 'p1', rawContent: 'ISA' } as any);

    expect(events.emit).toHaveBeenCalledWith('edi.document.received', expect.any(Object));
    expect(events.emit).toHaveBeenCalledWith('edi.204.received', expect.any(Object));
  });

  it('handles parse errors', async () => {
    controlNumbers.nextTriple.mockResolvedValue({ isaControlNumber: '1', gsControlNumber: '2', stControlNumber: '3' });
    parser.parse.mockImplementation(() => { throw new Error('bad'); });
    prisma.ediMessage.create.mockResolvedValue({ id: 'm1' });

    await service.importDocument('tenant-1', 'user-1', { transactionType: 'EDI_204', tradingPartnerId: 'p1', rawContent: 'ISA' } as any);

    expect(events.emit).toHaveBeenCalledWith('edi.document.error', expect.objectContaining({ error: 'bad' }));
  });

  it('acknowledges document', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue({ id: 'm1' });
    prisma.ediAcknowledgment.create.mockResolvedValue({ id: 'ack1' });
    prisma.ediMessage.update.mockResolvedValue({});

    await service.acknowledge('tenant-1', 'm1', { ackControlNumber: '1', ackStatus: 'A' } as any);

    expect(events.emit).toHaveBeenCalledWith('edi.997.sent', expect.any(Object));
  });
});
