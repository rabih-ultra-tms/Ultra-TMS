import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../../prisma.service';
import { CredentialMaskerService } from './services/credential-masker.service';
import { EncryptionService } from './services/encryption.service';

describe('IntegrationsService', () => {
  let service: IntegrationsService;
  let prisma: {
    integrationProviderConfig: { findMany: jest.Mock; findFirst: jest.Mock };
    integration: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    aPIRequestLog: {
      count: jest.Mock;
      aggregate: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const encryptionService = {
    encrypt: jest.fn((val: any) => val),
  };

  const credentialMasker = {
    maskIntegration: jest.fn((val: any) => val),
    maskObject: jest.fn((val: any) => val),
  };

  beforeEach(async () => {
    prisma = {
      integrationProviderConfig: { findMany: jest.fn(), findFirst: jest.fn() },
      integration: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      aPIRequestLog: {
        count: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EncryptionService, useValue: encryptionService },
        { provide: CredentialMaskerService, useValue: credentialMasker },
      ],
    }).compile();

    service = module.get(IntegrationsService);
  });

  it('lists integrations excluding deleted', async () => {
    prisma.integration.findMany.mockResolvedValue([]);
    prisma.integration.count.mockResolvedValue(0);

    await service.listIntegrations('tenant-1', {} as any);

    expect(prisma.integration.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', deletedAt: null }),
      }),
    );
  });

  it('lists providers by category', async () => {
    prisma.integrationProviderConfig.findMany.mockResolvedValue([
      {
        id: 'p1',
        providerName: 'HubSpot',
        category: 'CRM',
        authType: 'API_KEY',
        baseUrl: 'https://api',
        documentationUrl: 'https://docs',
        logoUrl: 'https://logo',
        isActive: true,
      },
    ]);

    const result = await service.listProviders('tenant-1', { category: 'CRM' } as any);

    expect(prisma.integrationProviderConfig.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1', category: 'CRM', isActive: true }),
      }),
    );
    expect(result[0]?.providerName).toBe('HubSpot');
  });

  it('lists provider categories', async () => {
    prisma.integrationProviderConfig.findMany.mockResolvedValue([
      { category: 'CRM' },
      { category: 'EDI' },
      { category: 'CRM' },
    ]);

    const result = await service.listProviderCategories('tenant-1');

    expect(result).toEqual(['CRM', 'EDI']);
  });

  it('returns provider by id', async () => {
    prisma.integrationProviderConfig.findFirst.mockResolvedValue({
      id: 'p1',
      providerName: 'HubSpot',
      category: 'CRM',
      authType: 'API_KEY',
      baseUrl: 'https://api',
      documentationUrl: 'https://docs',
      logoUrl: 'https://logo',
      isActive: true,
    });

    const result = await service.getProvider('tenant-1', 'p1');

    expect(result.id).toBe('p1');
  });

  it('throws when integration not found', async () => {
    prisma.integration.findFirst.mockResolvedValue(null);

    await expect(service.getIntegration('tenant-1', 'int-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates integration and encrypts secrets', async () => {
    prisma.integration.create.mockResolvedValue({
      id: 'int-1',
      tenantId: 'tenant-1',
      name: 'Int',
      description: null,
      category: 'CRM',
      provider: 'HubSpot',
      authType: 'API_KEY',
      config: {},
      syncFrequency: 'MANUAL',
      status: 'ACTIVE',
      lastSyncAt: null,
      nextSyncAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    await service.createIntegration('tenant-1', 'user-1', {
      name: 'Int',
      category: 'CRM',
      provider: 'HubSpot',
      authType: 'API_KEY',
      apiKey: 'key',
      apiSecret: 'secret',
      oauthTokens: { token: 't' },
      config: { a: 1 },
    } as any);

    expect(encryptionService.encrypt).toHaveBeenCalledWith('key');
    expect(encryptionService.encrypt).toHaveBeenCalledWith('secret');
    expect(prisma.integration.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tenantId: 'tenant-1', name: 'Int' }) }),
    );
  });

  it('updates integration fields and returns updated dto', async () => {
    jest.spyOn(service, 'getIntegration')
      .mockResolvedValueOnce({ id: 'int-1' } as any)
      .mockResolvedValueOnce({ id: 'int-1', status: 'PAUSED' } as any);

    const result = await service.updateIntegration('tenant-1', 'int-1', 'user-1', {
      name: 'Updated',
      apiKey: 'new-key',
      status: 'PAUSED',
    } as any);

    expect(prisma.integration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'Updated', status: 'PAUSED', updatedById: 'user-1' }),
      }),
    );
    expect(result.status).toBe('PAUSED');
  });

  it('updates credentials only', async () => {
    jest.spyOn(service, 'getIntegration').mockResolvedValue({ id: 'int-1' } as any);

    await service.updateCredentials('tenant-1', 'int-1', 'user-1', { apiKey: 'k2' } as any);

    expect(prisma.integration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ apiKey: 'k2', updatedById: 'user-1' }),
      }),
    );
  });

  it('soft deletes integration and pauses', async () => {
    prisma.integration.findFirst.mockResolvedValue({ id: 'int-1' });

    await service.deleteIntegration('tenant-1', 'int-1');

    expect(prisma.integration.update).toHaveBeenCalledWith({
      where: { id: 'int-1' },
      data: { deletedAt: expect.any(Date), status: 'PAUSED' },
    });
  });

  it('tests connection updates status', async () => {
    jest.spyOn(service, 'getIntegration').mockResolvedValue({ id: 'int-1' } as any);
    jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = await service.testConnection('tenant-1', 'int-1');

    expect(prisma.integration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('toggles status', async () => {
    jest.spyOn(service, 'getIntegration')
      .mockResolvedValueOnce({ id: 'int-1' } as any)
      .mockResolvedValueOnce({ id: 'int-1', status: 'PAUSED' } as any);

    const result = await service.toggleStatus('tenant-1', 'int-1', { status: 'PAUSED' } as any);

    expect(prisma.integration.update).toHaveBeenCalledWith({ where: { id: 'int-1' }, data: { status: 'PAUSED' } });
    expect(result.status).toBe('PAUSED');
  });

  it('handles oauth authorize and callback', async () => {
    jest.spyOn(service, 'getIntegration')
      .mockResolvedValueOnce({ id: 'int-1' } as any)
      .mockResolvedValueOnce({ id: 'int-1' } as any)
      .mockResolvedValueOnce({ id: 'int-1' } as any);

    const auth = await service.oauthAuthorize('tenant-1', 'int-1');

    expect(auth.authorizationUrl).toContain('int-1');
    expect(prisma.integration.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PENDING_AUTH' } }),
    );

    await service.oauthCallback('tenant-1', 'int-1', { token: 't1' });

    expect(prisma.integration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }),
    );
  });

  it('returns health and healthAll', async () => {
    jest.spyOn(service, 'getIntegration').mockResolvedValue({
      id: 'int-1',
      status: 'ACTIVE',
      lastSyncAt: null,
      nextSyncAt: null,
    } as any);
    prisma.integration.findMany.mockResolvedValue([
      { id: 'int-1', status: 'ACTIVE', lastSyncAt: null, nextSyncAt: null },
    ]);

    const health = await service.health('tenant-1', 'int-1');
    const healthAll = await service.healthAll('tenant-1');

    expect(health.id).toBe('int-1');
    expect(healthAll).toHaveLength(1);
  });

  it('returns stats', async () => {
    jest.spyOn(service, 'getIntegration').mockResolvedValue({ id: 'int-1' } as any);
    prisma.aPIRequestLog.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7);
    prisma.aPIRequestLog.aggregate.mockResolvedValue({ _avg: { durationMs: 120 } });

    const result = await service.stats('tenant-1', 'int-1');

    expect(result).toEqual(
      expect.objectContaining({ totalRequests: 10, successfulRequests: 7, failedRequests: 3, averageDurationMs: 120 }),
    );
  });

  it('lists api logs', async () => {
    jest.spyOn(service, 'getIntegration').mockResolvedValue({ id: 'int-1' } as any);
    prisma.aPIRequestLog.findMany.mockResolvedValue([
      { id: 'log-1', integrationId: 'int-1', endpoint: '/v1', method: 'GET', responseStatus: 200, durationMs: 50, timestamp: new Date() },
    ]);
    prisma.aPIRequestLog.count.mockResolvedValue(1);

    const result = await service.listLogs('tenant-1', 'int-1', { endpoint: '/v1' } as any);

    expect(result.total).toBe(1);
    expect(result.data[0]?.endpoint).toBe('/v1');
  });
});
