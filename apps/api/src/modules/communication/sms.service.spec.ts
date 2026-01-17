import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SmsService } from './sms.service';
import { PrismaService } from '../../prisma.service';
import { TwilioProvider } from './providers/twilio.provider';
import { TemplatesService } from './templates.service';

describe('SmsService', () => {
  let service: SmsService;
  let prisma: {
    smsConversation: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    smsMessage: { create: jest.Mock; update: jest.Mock; updateMany: jest.Mock };
    communicationLog: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let twilio: {
    formatPhoneNumber: jest.Mock;
    sendSms: jest.Mock;
    parseInboundMessage: jest.Mock;
  };
  let templates: { findByCode: jest.Mock; renderTemplate: jest.Mock };

  beforeEach(async () => {
    prisma = {
      smsConversation: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      smsMessage: { create: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      communicationLog: { create: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    };
    twilio = {
      formatPhoneNumber: jest.fn((phone: string) => `+1${phone}`),
      sendSms: jest.fn(),
      parseInboundMessage: jest.fn(),
    };
    templates = {
      findByCode: jest.fn(),
      renderTemplate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TwilioProvider, useValue: twilio },
        { provide: TemplatesService, useValue: templates },
      ],
    }).compile();

    service = module.get(SmsService);
  });

  it('throws when template not found', async () => {
    templates.findByCode.mockResolvedValue(null);

    await expect(
      service.send('tenant-1', 'user-1', { phoneNumber: '5550001', templateCode: 'WELCOME' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when message is missing', async () => {
    await expect(
      service.send('tenant-1', 'user-1', { phoneNumber: '5550001', message: '' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('sends sms and updates records', async () => {
    templates.findByCode.mockResolvedValue({ bodyEn: 'Hi {{name}}' });
    templates.renderTemplate.mockReturnValue('Hi Sam');
    prisma.smsConversation.findUnique.mockResolvedValue(null);
    prisma.smsConversation.create.mockResolvedValue({ id: 'conv-1' });
    prisma.smsMessage.create.mockResolvedValue({ id: 'msg-1' });
    prisma.communicationLog.create.mockResolvedValue({ id: 'log-1' });
    twilio.sendSms.mockResolvedValue({ success: true, messageId: 'tw-1' });

    const result = await service.send('tenant-1', 'user-1', {
      phoneNumber: '5550001',
      templateCode: 'WELCOME',
      variables: { name: 'Sam' },
      recipientType: 'CUSTOMER',
      recipientId: 'c1',
      recipientName: 'Sam',
    } as any);

    expect(prisma.smsConversation.create).toHaveBeenCalled();
    expect(prisma.smsMessage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SENT', providerMessageId: 'tw-1' }),
      }),
    );
    expect(prisma.communicationLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SENT', provider: 'TWILIO', providerMessageId: 'tw-1' }),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({ success: true, conversationId: 'conv-1', messageId: 'msg-1', logId: 'log-1' }),
    );
  });

  it('returns paged conversations with filters', async () => {
    prisma.smsConversation.findMany.mockResolvedValue([]);
    prisma.smsConversation.count.mockResolvedValue(0);

    await service.getConversations('tenant-1', { page: 2, limit: 5, status: 'ACTIVE', search: 'sam' });

    expect(prisma.smsConversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        where: expect.objectContaining({ tenantId: 'tenant-1', status: 'ACTIVE' }),
      }),
    );
  });

  it('gets conversation and marks inbound as read', async () => {
    prisma.smsConversation.findFirst.mockResolvedValue({ id: 'conv-1', unreadCount: 2, tenantId: 'tenant-1' });

    await service.getConversation('tenant-1', 'conv-1');

    expect(prisma.smsConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { unreadCount: 0 },
    });
    expect(prisma.smsMessage.updateMany).toHaveBeenCalled();
  });

  it('throws when conversation not found', async () => {
    prisma.smsConversation.findFirst.mockResolvedValue(null);

    await expect(service.getConversation('tenant-1', 'conv-1')).rejects.toThrow(BadRequestException);
  });

  it('replies using existing conversation', async () => {
    prisma.smsConversation.findFirst.mockResolvedValue({
      id: 'conv-1',
      tenantId: 'tenant-1',
      phoneNumber: '+15550001',
      participantType: 'CUSTOMER',
      participantId: 'c1',
      participantName: 'Sam',
      loadId: 'load-1',
    });
    jest.spyOn(service, 'send').mockResolvedValue({ success: true } as any);

    await service.reply('tenant-1', 'conv-1', 'user-1', { message: 'Hello' } as any);

    expect(service.send).toHaveBeenCalledWith(
      'tenant-1',
      'user-1',
      expect.objectContaining({ phoneNumber: '+15550001', message: 'Hello', loadId: 'load-1' }),
    );
  });

  it('handles inbound webhook and creates conversation when missing', async () => {
    twilio.parseInboundMessage.mockReturnValue({
      messageId: 'tw-1',
      from: '+15550001',
      to: '+15559999',
      body: 'Hi',
      mediaUrls: [],
    });
    prisma.smsConversation.findFirst.mockResolvedValue(null);
    prisma.smsConversation.create.mockResolvedValue({ id: 'conv-1' });
    prisma.smsMessage.create.mockResolvedValue({ id: 'msg-1' });

    const result = await service.handleInboundWebhook('tenant-1', { MessageSid: 'tw-1' } as any);

    expect(prisma.smsConversation.create).toHaveBeenCalled();
    expect(prisma.smsConversation.update).toHaveBeenCalled();
    expect(prisma.communicationLog.create).toHaveBeenCalled();
    expect(result).toEqual({ success: true, conversationId: 'conv-1', messageId: 'msg-1' });
  });

  it('closes conversation', async () => {
    prisma.smsConversation.findFirst.mockResolvedValue({ id: 'conv-1' });

    await service.closeConversation('tenant-1', 'conv-1');

    expect(prisma.smsConversation.update).toHaveBeenCalledWith({
      where: { id: 'conv-1' },
      data: { status: 'CLOSED' },
    });
  });

  it('returns logs with meta', async () => {
    prisma.communicationLog.findMany.mockResolvedValue([]);
    prisma.communicationLog.count.mockResolvedValue(0);

    const result = await service.getLogs('tenant-1', { page: 1, limit: 10 });

    expect(result.meta.total).toBe(0);
  });

  it('returns sms stats', async () => {
    prisma.communicationLog.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    prisma.smsConversation.count.mockResolvedValue(5);

    const result = await service.getStats('tenant-1');

    expect(result).toEqual({ total: 10, sent: 4, delivered: 3, failed: 2, received: 1, activeConversations: 5 });
  });
});
