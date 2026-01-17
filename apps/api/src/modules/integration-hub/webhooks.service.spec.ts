jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    WebhookStatus: {
      DELIVERED: 'DELIVERED',
      RETRYING: 'RETRYING',
    },
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WebhookStatus } from '@prisma/client';
import { WebhooksService } from './webhooks.service';
import { PrismaService } from '../../prisma.service';
import { CredentialMaskerService } from './services/credential-masker.service';

describe('WebhooksService', () => {
  let service: WebhooksService;
  let prisma: {
    webhookEndpoint: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    webhookSubscription: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    webhookDelivery: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
    };
  };

  const credentialMasker = {
    maskWebhookEndpoint: jest.fn((val: any) => val),
    maskSecret: jest.fn((val: any) => val),
  };

  beforeEach(async () => {
    prisma = {
      webhookEndpoint: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      webhookSubscription: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      webhookDelivery: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: CredentialMaskerService, useValue: credentialMasker },
      ],
    }).compile();

    service = module.get(WebhooksService);
  });

  it('lists endpoints excluding deleted', async () => {
    prisma.webhookEndpoint.findMany.mockResolvedValue([]);
    prisma.webhookEndpoint.count.mockResolvedValue(0);

    await service.listEndpoints('tenant-1', {} as any);

    expect(prisma.webhookEndpoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null }),
      }),
    );
  });

  it('throws when endpoint not found', async () => {
    prisma.webhookEndpoint.findFirst.mockResolvedValue(null);

    await expect(service.getEndpoint('tenant-1', 'ep-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('soft deletes endpoint', async () => {
    prisma.webhookEndpoint.findFirst.mockResolvedValue({ id: 'ep-1' });

    await service.deleteEndpoint('tenant-1', 'ep-1');

    expect(prisma.webhookEndpoint.update).toHaveBeenCalledWith({
      where: { id: 'ep-1' },
      data: { deletedAt: expect.any(Date), status: 'DISABLED' },
    });
  });

  it('creates endpoint and returns secret', async () => {
    jest.spyOn(service as any, 'generateSecret').mockReturnValue('secret-1');
    prisma.webhookEndpoint.create.mockResolvedValue({
      id: 'ep-1',
      name: 'Webhook',
      url: 'https://example.com',
      events: ['ORDER.CREATED'],
      description: null,
      secret: 'secret-1',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createEndpoint('tenant-1', 'user-1', {
      name: 'Webhook',
      url: 'https://example.com',
      events: ['ORDER.CREATED'],
    } as any);

    expect(result.secret).toBe('secret-1');
    expect(result.endpoint.secret).toBe('secret-1');
  });

  it('rotates endpoint secret', async () => {
    jest.spyOn(service as any, 'generateSecret').mockReturnValue('secret-2');
    prisma.webhookEndpoint.findFirst
      .mockResolvedValueOnce({ id: 'ep-1' })
      .mockResolvedValueOnce({
        id: 'ep-1',
        name: 'Webhook',
        url: 'https://example.com',
        events: [],
        description: null,
        secret: 'secret-2',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    const result = await service.rotateSecret('tenant-1', 'ep-1', 'user-1');

    expect(prisma.webhookEndpoint.update).toHaveBeenCalledWith({
      where: { id: 'ep-1' },
      data: { secret: 'secret-2', updatedById: 'user-1' },
    });
    expect(result.secret).toBe('secret-2');
  });

  it('lists subscriptions with filters', async () => {
    prisma.webhookSubscription.findMany.mockResolvedValue([]);
    prisma.webhookSubscription.count.mockResolvedValue(0);

    await service.listSubscriptions('tenant-1', { isActive: true } as any, 'ep-1');

    expect(prisma.webhookSubscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', webhookEndpointId: 'ep-1', isActive: true }),
      }),
    );
  });

  it('creates subscription and returns dto', async () => {
    prisma.webhookEndpoint.findFirst.mockResolvedValue({ id: 'ep-1' });
    prisma.webhookSubscription.create.mockResolvedValue({ id: 'sub-1' });
    prisma.webhookSubscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      webhookEndpointId: 'ep-1',
      eventType: 'ORDER.CREATED',
      filterConditions: { status: 'OPEN' },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createSubscription('tenant-1', 'user-1', {
      webhookEndpointId: 'ep-1',
      eventType: 'ORDER.CREATED',
      filterConditions: { status: 'OPEN' },
    } as any);

    expect(prisma.webhookSubscription.create).toHaveBeenCalled();
    expect(result.eventType).toBe('ORDER.CREATED');
  });

  it('tests subscription by creating delivery', async () => {
    prisma.webhookSubscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      webhookEndpointId: 'ep-1',
    });
    prisma.webhookDelivery.create.mockResolvedValue({ id: 'del-1' });

    const result = await service.testSubscription('tenant-1', 'sub-1');

    expect(prisma.webhookDelivery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: WebhookStatus.DELIVERED, responseStatus: 200 }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('lists deliveries for endpoint', async () => {
    prisma.webhookEndpoint.findFirst.mockResolvedValue({ id: 'ep-1' });
    prisma.webhookDelivery.findMany.mockResolvedValue([]);
    prisma.webhookDelivery.count.mockResolvedValue(0);

    await service.listDeliveries('tenant-1', 'ep-1', { status: 'FAILED' } as any);

    expect(prisma.webhookDelivery.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', endpointId: 'ep-1', status: 'FAILED' }),
      }),
    );
  });

  it('replays a delivery', async () => {
    prisma.webhookEndpoint.findFirst.mockResolvedValue({ id: 'ep-1' });
    prisma.webhookDelivery.findFirst.mockResolvedValue({
      id: 'del-1',
      endpointId: 'ep-1',
      tenantId: 'tenant-1',
      integrationId: 'int-1',
      event: 'ORDER.CREATED',
      payload: { ok: true },
      requestHeaders: { h: 'v' },
      requestBody: { a: 1 },
    });
    prisma.webhookDelivery.create.mockResolvedValue({
      id: 'del-2',
      event: 'ORDER.CREATED',
      status: WebhookStatus.RETRYING,
      attempts: 0,
      createdAt: new Date(),
    });

    const result = await service.replayDelivery('tenant-1', 'ep-1', 'del-1');

    expect(prisma.webhookDelivery.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: WebhookStatus.RETRYING, attempts: 0 }),
      }),
    );
    expect(result.status).toBe(WebhookStatus.RETRYING);
  });
});
