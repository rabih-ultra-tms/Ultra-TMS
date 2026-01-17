import { Test, TestingModule } from '@nestjs/testing';
import { HubspotService } from './hubspot.service';
import { PrismaService } from '../../prisma.service';

describe('HubspotService', () => {
  let service: HubspotService;
  let prisma: {
    company: { findFirst: jest.Mock; findMany: jest.Mock };
    contact: { findFirst: jest.Mock; findMany: jest.Mock };
    opportunity: { findFirst: jest.Mock; findMany: jest.Mock };
    hubspotSyncLog: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      company: { findFirst: jest.fn(), findMany: jest.fn() },
      contact: { findFirst: jest.fn(), findMany: jest.fn() },
      opportunity: { findFirst: jest.fn(), findMany: jest.fn() },
      hubspotSyncLog: { create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [HubspotService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(HubspotService);
  });

  it('returns false for isConfigured', async () => {
    await expect(service.isConfigured('tenant-1')).resolves.toBe(false);
  });

  it('returns error when syncing missing company', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    const result = await service.syncCompany('tenant-1', 'cmp-1');

    expect(result).toEqual({ success: false, error: 'Company not found' });
    expect(prisma.hubspotSyncLog.create).not.toHaveBeenCalled();
  });

  it('logs sync for company and returns hubspotId', async () => {
    prisma.company.findFirst.mockResolvedValue({
      id: 'cmp-1',
      name: 'Acme',
      website: 'acme.com',
      phone: '555',
      industry: 'Logistics',
      hubspotId: 'hs-1',
    });

    const result = await service.syncCompany('tenant-1', 'cmp-1');

    expect(prisma.hubspotSyncLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          entityType: 'COMPANY',
          entityId: 'cmp-1',
          hubspotId: 'hs-1',
          payloadSent: expect.objectContaining({ name: 'Acme', domain: 'acme.com' }),
        }),
      }),
    );
    expect(result).toEqual({ success: true, hubspotId: 'hs-1' });
  });

  it('logs sync for contact when found', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'ct-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '123',
      hubspotId: null,
    });

    const result = await service.syncContact('tenant-1', 'ct-1');

    expect(prisma.hubspotSyncLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'CONTACT',
          entityId: 'ct-1',
          hubspotId: 'pending',
          payloadSent: expect.objectContaining({ email: 'jane@example.com' }),
        }),
      }),
    );
    expect(result).toEqual({ success: true, hubspotId: undefined });
  });

  it('maps deal stage on syncDeal', async () => {
    prisma.opportunity.findFirst.mockResolvedValue({
      id: 'opp-1',
      name: 'Big Deal',
      stage: 'WON',
      estimatedValue: 1000,
      expectedCloseDate: new Date('2024-01-01'),
      hubspotDealId: null,
      company: { id: 'cmp-1', name: 'Acme' },
    });

    await service.syncDeal('tenant-1', 'opp-1');

    expect(prisma.hubspotSyncLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'DEAL',
          payloadSent: expect.objectContaining({ dealstage: 'closedwon' }),
        }),
      }),
    );
  });

  it('bulk syncs companies with optional ids', async () => {
    prisma.company.findMany.mockResolvedValue([{ id: 'cmp-1' }, { id: 'cmp-2' }]);

    const result = await service.bulkSyncCompanies('tenant-1', ['cmp-1']);

    expect(prisma.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { in: ['cmp-1'] } }),
      }),
    );
    expect(result).toEqual({ queued: 2 });
  });

  it('returns sync status with counts and configured flag', async () => {
    prisma.hubspotSyncLog.findMany.mockResolvedValue([]);
    prisma.hubspotSyncLog.count.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    jest.spyOn(service, 'isConfigured').mockResolvedValue(true);

    const result = await service.getSyncStatus('tenant-1', { limit: 10 });

    expect(result).toEqual(
      expect.objectContaining({ pendingCount: 3, failedCount: 1, isConfigured: true }),
    );
  });

  it('handles webhook payloads', async () => {
    await expect(service.handleWebhook('tenant-1', { event: 'deal.updated' })).resolves.toEqual({ processed: true });
  });

  it('configures field mapping stub', async () => {
    await expect(service.configureFieldMapping('tenant-1', { name: 'company_name' })).resolves.toEqual({ success: true });
  });
});
