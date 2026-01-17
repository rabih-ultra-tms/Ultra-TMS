jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    EdiCommunicationProtocol: {
      SFTP: 'SFTP',
      AS2: 'AS2',
      FTP: 'FTP',
    },
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TradingPartnersService } from './trading-partners.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FtpTransport } from '../transport/ftp.transport';
import { SftpTransport } from '../transport/sftp.transport';
import { As2Transport } from '../transport/as2.transport';

describe('TradingPartnersService', () => {
  let service: TradingPartnersService;
  let prisma: any;
  let events: { emit: jest.Mock };
  let ftpTransport: { testConnection: jest.Mock };
  let sftpTransport: { testConnection: jest.Mock };
  let as2Transport: { testConnection: jest.Mock };

  beforeEach(async () => {
    prisma = {
      ediTradingPartner: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      ediCommunicationLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
      },
    };
    events = { emit: jest.fn() };
    ftpTransport = { testConnection: jest.fn() };
    sftpTransport = { testConnection: jest.fn() };
    as2Transport = { testConnection: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradingPartnersService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
        { provide: FtpTransport, useValue: ftpTransport },
        { provide: SftpTransport, useValue: sftpTransport },
        { provide: As2Transport, useValue: as2Transport },
      ],
    }).compile();

    service = module.get(TradingPartnersService);
  });

  it('rejects duplicate ISA ID', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({ id: 'p1' });

    await expect(
      service.create('t1', 'u1', { partnerName: 'A', isaId: 'ISA1', partnerType: 'CARRIER' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates trading partner', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue(null);
    prisma.ediTradingPartner.create.mockResolvedValue({ id: 'p1' });

    const result = await service.create('t1', 'u1', {
      partnerName: 'A',
      partnerType: 'CARRIER',
      isaId: 'ISA1',
      protocol: 'SFTP',
    } as any);

    expect(result.id).toBe('p1');
  });

  it('finds partners with pagination', async () => {
    prisma.ediTradingPartner.findMany.mockResolvedValue([{ id: 'p1' }]);
    prisma.ediTradingPartner.count.mockResolvedValue(1);

    const result = await service.findAll('t1', { page: 2, limit: 10, search: 'abc' } as any);

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(prisma.ediTradingPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );
  });

  it('finds partners with filters and no search', async () => {
    prisma.ediTradingPartner.findMany.mockResolvedValue([{ id: 'p1' }]);
    prisma.ediTradingPartner.count.mockResolvedValue(1);

    await service.findAll('t1', { isActive: false, protocol: 'FTP', partnerType: 'CARRIER' } as any);

    expect(prisma.ediTradingPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: false, protocol: 'FTP', partnerType: 'CARRIER' }),
      }),
    );
  });

  it('toggles status', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({ id: 'p1', isActive: true });
    prisma.ediTradingPartner.update.mockResolvedValue({ id: 'p1', isActive: false });

    const result = await service.toggleStatus('t1', 'u1', 'p1');

    expect(result.isActive).toBe(false);
  });

  it('updates trading partner with field mappings', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({ id: 'p1', isaId: 'ISA1' });
    prisma.ediTradingPartner.update.mockResolvedValue({ id: 'p1' });

    await service.update('t1', 'u1', 'p1', {
      partnerName: 'New',
      sendFunctionalAck: false,
      requireFunctionalAck: true,
      testMode: true,
      fieldMappings: null,
    } as any);

    expect(prisma.ediTradingPartner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fieldMappings: Prisma.JsonNull, sendFunctionalAck: false, testMode: true }),
      }),
    );
  });

  it('rejects update when ISA ID conflicts', async () => {
    prisma.ediTradingPartner.findFirst
      .mockResolvedValueOnce({ id: 'p1', isaId: 'ISA1' })
      .mockResolvedValueOnce({ id: 'p2' });

    await expect(service.update('t1', 'u1', 'p1', { isaId: 'ISA2' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('tests SFTP connection and logs success', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({
      id: 'p1',
      protocol: 'SFTP',
      ftpHost: 'host',
      ftpUsername: 'user',
    });
    sftpTransport.testConnection.mockResolvedValue({ success: true, protocol: 'SFTP' });

    const result = await service.testConnection('t1', 'p1');

    expect(result).toEqual({ success: true, protocol: 'SFTP' });
    expect(prisma.ediCommunicationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tradingPartnerId: 'p1', status: 'SUCCESS' }),
    });
    expect(events.emit).toHaveBeenCalledWith('edi.partner.connected', { partnerId: 'p1' });
  });

  it('tests FTP connection and logs success', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({
      id: 'p1',
      protocol: 'FTP',
      ftpHost: 'host',
      ftpUsername: 'user',
    });
    ftpTransport.testConnection.mockResolvedValue({ success: true, protocol: 'FTP' });

    const result = await service.testConnection('t1', 'p1');

    expect(result).toEqual({ success: true, protocol: 'FTP' });
    expect(prisma.ediCommunicationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tradingPartnerId: 'p1', status: 'SUCCESS' }),
    });
  });

  it('logs failure and rethrows on connection error', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({
      id: 'p1',
      protocol: 'AS2',
      as2Url: 'url',
      as2Identifier: 'id',
    });
    as2Transport.testConnection.mockRejectedValue(new Error('fail'));

    await expect(service.testConnection('t1', 'p1')).rejects.toThrow('fail');

    expect(prisma.ediCommunicationLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tradingPartnerId: 'p1', status: 'FAILED', errorMessage: 'fail' }),
    });
    expect(events.emit).toHaveBeenCalledWith('edi.partner.error', { partnerId: 'p1', error: 'fail' });
  });

  it('returns activity for partner', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.ediCommunicationLog.findMany.mockResolvedValue([{ id: 'l1' }]);

    const result = await service.activity('t1', 'p1');

    expect(result).toEqual([{ id: 'l1' }]);
  });

  it('removes partner and returns success', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.ediTradingPartner.update.mockResolvedValue({ id: 'p1', isActive: false });

    const result = await service.remove('t1', 'u1', 'p1');

    expect(result).toEqual({ success: true });
  });

  it('throws when partner missing', async () => {
    prisma.ediTradingPartner.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'missing')).rejects.toThrow('Trading partner not found');
  });
});
