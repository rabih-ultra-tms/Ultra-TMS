import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EmailService } from './email.service';
import { PrismaService } from '../../prisma.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { TemplatesService } from './templates.service';

describe('EmailService', () => {
  let service: EmailService;
  let prisma: {
    communicationLog: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let sendGrid: { sendEmail: jest.Mock };
  let templates: { findByCode: jest.Mock; renderTemplate: jest.Mock };

  beforeEach(async () => {
    prisma = {
      communicationLog: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
    };
    sendGrid = { sendEmail: jest.fn() };
    templates = { findByCode: jest.fn(), renderTemplate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: PrismaService, useValue: prisma },
        { provide: SendGridProvider, useValue: sendGrid },
        { provide: TemplatesService, useValue: templates },
      ],
    }).compile();

    service = module.get(EmailService);
  });

  it('throws when template missing', async () => {
    templates.findByCode.mockResolvedValue(null);

    await expect(
      service.send('tenant-1', 'user-1', { templateCode: 'WELCOME', recipientEmail: 'a@b.com' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when subject/body missing', async () => {
    await expect(
      service.send('tenant-1', 'user-1', { recipientEmail: 'a@b.com', subject: '', body: '' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('sends email from template and updates log', async () => {
    templates.findByCode.mockResolvedValue({
      id: 'tpl-1',
      subjectEn: 'Hi {{name}}',
      bodyEn: 'Body {{name}}',
      fromName: 'Support',
      fromEmail: 'support@example.com',
      replyTo: 'reply@example.com',
    });
    templates.renderTemplate.mockImplementation((tpl: string, vars: any) => tpl.replace('{{name}}', vars.name));
    prisma.communicationLog.create.mockResolvedValue({ id: 'log-1' });
    sendGrid.sendEmail.mockResolvedValue({ success: true, messageId: 'sg-1' });

    const result = await service.send('tenant-1', 'user-1', {
      templateCode: 'WELCOME',
      recipientEmail: 'a@b.com',
      recipientName: 'Sam',
      variables: { name: 'Sam' },
    } as any);

    expect(prisma.communicationLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          channel: 'EMAIL',
          templateId: 'tpl-1',
          subject: 'Hi Sam',
          body: 'Body Sam',
          bodyHtml: 'Body Sam',
        }),
      }),
    );
    expect(sendGrid.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'a@b.com', subject: 'Hi Sam', from: 'support@example.com', replyTo: 'reply@example.com' }),
    );
    expect(prisma.communicationLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SENT', provider: 'SENDGRID', providerMessageId: 'sg-1' }),
      }),
    );
    expect(result).toEqual(expect.objectContaining({ success: true, logId: 'log-1', messageId: 'sg-1' }));
  });

  it('returns failure when sendgrid fails', async () => {
    prisma.communicationLog.create.mockResolvedValue({ id: 'log-1' });
    sendGrid.sendEmail.mockResolvedValue({ success: false, error: 'down' });

    const result = await service.send('tenant-1', 'user-1', {
      recipientEmail: 'a@b.com',
      subject: 'Hi',
      body: 'Body',
    } as any);

    expect(prisma.communicationLog.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED', errorMessage: 'down' }) }),
    );
    expect(result.success).toBe(false);
  });

  it('sends bulk emails and counts results', async () => {
    jest.spyOn(service, 'send')
      .mockResolvedValueOnce({ success: true } as any)
      .mockResolvedValueOnce({ success: false } as any);

    const result = await service.sendBulk('tenant-1', 'user-1', {
      recipients: [
        { email: 'a@b.com', name: 'A' },
        { email: 'b@b.com', name: 'B' },
      ],
      subject: 'Hello',
      body: 'Body',
    } as any);

    expect(result).toEqual(expect.objectContaining({ total: 2, successful: 1, failed: 1 }));
  });

  it('lists logs with filters and date range', async () => {
    prisma.communicationLog.findMany.mockResolvedValue([]);
    prisma.communicationLog.count.mockResolvedValue(0);

    await service.getLogs('tenant-1', { status: 'SENT', fromDate: '2024-01-01', toDate: '2024-01-31' });

    expect(prisma.communicationLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          channel: 'EMAIL',
          status: 'SENT',
          createdAt: expect.objectContaining({ gte: new Date('2024-01-01'), lte: new Date('2024-01-31') }),
        }),
      }),
    );
  });

  it('throws when log not found', async () => {
    prisma.communicationLog.findFirst.mockResolvedValue(null);

    await expect(service.getLogById('tenant-1', 'log-1')).rejects.toThrow(BadRequestException);
  });

  it('resends failed email and increments retry', async () => {
    prisma.communicationLog.findFirst.mockResolvedValue({
      id: 'log-1',
      status: 'FAILED',
      recipientEmail: 'a@b.com',
      subject: 'Sub',
      body: 'Body',
      bodyHtml: 'Body',
      providerMessageId: 'old',
      errorMessage: 'prev',
    });
    sendGrid.sendEmail.mockResolvedValue({ success: true, messageId: 'sg-2' });

    const result = await service.resend('tenant-1', 'log-1', 'user-1');

    expect(prisma.communicationLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'SENT', retryCount: { increment: 1 }, providerMessageId: 'sg-2' }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('prevents resending non-failed emails', async () => {
    prisma.communicationLog.findFirst.mockResolvedValue({ id: 'log-1', status: 'SENT' });

    await expect(service.resend('tenant-1', 'log-1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('returns stats', async () => {
    prisma.communicationLog.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const result = await service.getStats('tenant-1');

    expect(result).toEqual({ total: 10, sent: 4, delivered: 3, opened: 2, clicked: 1, failed: 0, bounced: 0 });
  });

  it('updates delivery/open/click/bounce events', async () => {
    prisma.communicationLog.updateMany.mockResolvedValue({ count: 1 });

    await service.handleDeliveryEvent('msg-1');
    await service.handleOpenEvent('msg-1');
    await service.handleClickEvent('msg-1');
    await service.handleBounceEvent('msg-1', 'bounce');

    expect(prisma.communicationLog.updateMany).toHaveBeenCalledTimes(4);
  });
});
