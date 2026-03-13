import { NotFoundException } from '@nestjs/common';
import { AlertsService, SavedViewsService } from './alerts.service';
import { PrismaService } from '../../prisma.service';

describe('AlertsService & SavedViewsService - Cross-Tenant Security', () => {
  let alertsService: AlertsService;
  let savedViewsService: SavedViewsService;
  let prisma: PrismaService;

  const mockPrisma = {
    kPIAlert: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    savedAnalyticsView: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = mockPrisma as unknown as PrismaService;
    alertsService = new AlertsService(prisma);
    savedViewsService = new SavedViewsService(prisma);
  });

  describe('Bug 5: Cross-Tenant Mutations', () => {
    it('should include tenantId in acknowledge update WHERE clause', async () => {
      const tenantId = 'tenant-1';
      const alertId = 'alert-1';
      const userId = 'user-1';

      mockPrisma.kPIAlert.findFirst.mockResolvedValueOnce({
        id: alertId,
        tenantId,
      });

      await alertsService.acknowledge(tenantId, userId, alertId, {
        notes: 'test',
      });

      // Verify that update was called
      expect(mockPrisma.kPIAlert.update).toHaveBeenCalled();

      // CRITICAL: The update WHERE clause MUST include tenantId for security
      // Without this, any user could mutate ANY alert by knowing its ID
      const updateCall = mockPrisma.kPIAlert.update.mock.calls[0];
      expect(updateCall[0].where).toEqual(
        expect.objectContaining({
          tenantId: tenantId,
        })
      );
    });

    it('should include tenantId in resolve update WHERE clause', async () => {
      const tenantId = 'tenant-1';
      const alertId = 'alert-1';
      const userId = 'user-1';

      mockPrisma.kPIAlert.findFirst.mockResolvedValueOnce({
        id: alertId,
        tenantId,
      });

      await alertsService.resolve(tenantId, userId, alertId, {
        resolutionNotes: 'test',
      });

      const updateCall = mockPrisma.kPIAlert.update.mock.calls[0];
      expect(updateCall[0].where).toEqual(
        expect.objectContaining({
          tenantId: tenantId,
        })
      );
    });

    it('should include tenantId in savedView delete WHERE clause', async () => {
      const tenantId = 'tenant-1';
      const viewId = 'view-1';
      const userId = 'user-1';

      mockPrisma.savedAnalyticsView.findFirst.mockResolvedValueOnce({
        id: viewId,
        tenantId,
        userId,
      });

      await savedViewsService.remove(tenantId, userId, viewId);

      // CRITICAL: Delete WHERE clause MUST include tenantId
      const deleteCall = mockPrisma.savedAnalyticsView.delete.mock.calls[0];
      expect(deleteCall[0].where).toEqual(
        expect.objectContaining({
          tenantId: tenantId,
        })
      );
    });

    it('should include tenantId in savedView update WHERE clause', async () => {
      const tenantId = 'tenant-1';
      const viewId = 'view-1';
      const userId = 'user-1';

      mockPrisma.savedAnalyticsView.findFirst.mockResolvedValueOnce({
        id: viewId,
        tenantId,
        userId,
      });

      await savedViewsService.update(tenantId, userId, viewId, {
        viewName: 'Updated',
        entityType: 'load',
      });

      const updateCall = mockPrisma.savedAnalyticsView.update.mock.calls[0];
      expect(updateCall[0].where).toEqual(
        expect.objectContaining({
          tenantId: tenantId,
        })
      );
    });

    it('should prevent access to data from other tenants via update race condition', async () => {
      const tenant1 = 'tenant-1';
      const tenant2 = 'tenant-2';
      const viewId = 'view-1';
      const userId = 'user-1';

      mockPrisma.savedAnalyticsView.findFirst
        .mockResolvedValueOnce({ id: viewId, tenantId: tenant1, userId })
        .mockResolvedValueOnce({ id: viewId, tenantId: tenant1, userId });

      await savedViewsService.update(tenant1, userId, viewId, {
        viewName: 'Updated',
        entityType: 'load',
      });

      const updateCall = mockPrisma.savedAnalyticsView.update.mock.calls[0];

      expect(updateCall[0].where).toHaveProperty('id', viewId);
      expect(updateCall[0].where).toHaveProperty('tenantId', tenant1);
    });
  });
});
