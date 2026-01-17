import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EdiGenerationService } from './edi-generation.service';
import { PrismaService } from '../../../prisma.service';
import { EdiControlNumberService } from '../control-number.service';
import { Edi204Generator } from './generators/edi-204.generator';
import { Edi210Generator } from './generators/edi-210.generator';
import { Edi214Generator } from './generators/edi-214.generator';
import { Edi990Generator } from './generators/edi-990.generator';
import { Edi997Generator } from './generators/edi-997.generator';
import { EdiDirection, EdiMessageStatus, EdiTransactionType } from '@prisma/client';

jest.mock('crypto', () => {
  const actual = jest.requireActual('crypto');
  return {
    ...actual,
    randomUUID: jest.fn(() => 'uuid-1'),
  };
});

describe('EdiGenerationService', () => {
  let service: EdiGenerationService;
  let prisma: any;
  let controlNumbers: { nextTriple: jest.Mock };
  let generator204: { generate: jest.Mock };
  let generator210: { generate: jest.Mock };
  let generator214: { generate: jest.Mock };
  let generator990: { generate: jest.Mock };
  let generator997: { generate: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      ediMessage: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      ediTradingPartner: {
        findFirst: jest.fn(),
      },
      ediCommunicationLog: {
        create: jest.fn(),
      },
    };
    controlNumbers = { nextTriple: jest.fn() };
    generator204 = { generate: jest.fn() };
    generator210 = { generate: jest.fn() };
    generator214 = { generate: jest.fn() };
    generator990 = { generate: jest.fn() };
    generator997 = { generate: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EdiGenerationService,
        { provide: PrismaService, useValue: prisma },
        { provide: EdiControlNumberService, useValue: controlNumbers },
        { provide: Edi204Generator, useValue: generator204 },
        { provide: Edi210Generator, useValue: generator210 },
        { provide: Edi214Generator, useValue: generator214 },
        { provide: Edi990Generator, useValue: generator990 },
        { provide: Edi997Generator, useValue: generator997 },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(EdiGenerationService);
  });

  it('generates 204 and emits event', async () => {
    controlNumbers.nextTriple.mockResolvedValue({ isaControlNumber: '1', gsControlNumber: '2', stControlNumber: '3' });
    generator204.generate.mockReturnValue('RAW204');
    prisma.ediMessage.create.mockResolvedValue({
      id: 'm1',
      tradingPartnerId: 'tp1',
      transactionType: EdiTransactionType.EDI_204,
      messageId: 'OUT-uuid-1',
      direction: EdiDirection.OUTBOUND,
      status: EdiMessageStatus.QUEUED,
    });

    const result = await service.generate204('t1', 'u1', { tradingPartnerId: 'tp1', loadId: 'l1' } as any);

    expect(result.id).toBe('m1');
    expect(prisma.ediMessage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 't1',
        tradingPartnerId: 'tp1',
        messageId: 'OUT-uuid-1',
        transactionType: EdiTransactionType.EDI_204,
        direction: EdiDirection.OUTBOUND,
        status: EdiMessageStatus.QUEUED,
        rawContent: 'RAW204',
      }),
    });
    expect(events.emit).toHaveBeenCalledWith('edi.document.processed', { documentId: 'm1', orderId: 'l1' });
  });

  it('generates 997 and emits event', async () => {
    controlNumbers.nextTriple.mockResolvedValue({ isaControlNumber: '1', gsControlNumber: '2', stControlNumber: '3' });
    generator997.generate.mockReturnValue('RAW997');
    prisma.ediMessage.create.mockResolvedValue({ id: 'm2', messageId: 'OUT-uuid-1' });

    const result = await service.generate997('t1', 'u1', { tradingPartnerId: 'tp1', originalMessageId: 'o1' } as any);

    expect(result.id).toBe('m2');
    expect(events.emit).toHaveBeenCalledWith('edi.997.sent', { documentId: 'm2', originalDocId: 'o1' });
  });

  it('throws when sending missing document', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue(null);

    await expect(service.sendDocument('t1', 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sends document and logs communication', async () => {
    prisma.ediMessage.findFirst.mockResolvedValue({
      id: 'm1',
      tenantId: 't1',
      tradingPartnerId: 'tp1',
      transactionType: 'EDI_204',
      messageId: 'OUT-uuid-1',
      direction: EdiDirection.OUTBOUND,
    });
    prisma.ediTradingPartner.findFirst.mockResolvedValue({ id: 'tp1', protocol: 'SFTP' });
    prisma.ediMessage.update.mockResolvedValue({ id: 'm1' });

    const result = await service.sendDocument('t1', 'm1');

    expect(result).toEqual({ success: true });
    expect(prisma.ediMessage.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: expect.objectContaining({ status: EdiMessageStatus.SENT }),
    });
    expect(prisma.ediCommunicationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 't1',
        tradingPartnerId: 'tp1',
        protocol: 'SFTP',
        action: 'SEND',
        status: 'SUCCESS',
        fileName: 'EDI_204-OUT-uuid-1.edi',
      }),
    });
  });
});
