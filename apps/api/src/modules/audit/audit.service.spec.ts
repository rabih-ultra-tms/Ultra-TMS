import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma.service';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: {
    auditLog: {
      count: jest.Mock;
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
    loginAudit: { groupBy: jest.Mock };
    aPIAuditLog: { count: jest.Mock };
    user: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      loginAudit: { groupBy: jest.fn() },
      aPIAuditLog: { count: jest.fn() },
      user: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AuditService);
  });

  it('builds compliance report with grouped stats', async () => {
    prisma.auditLog.count.mockResolvedValue(10);
    prisma.auditLog.groupBy
      .mockResolvedValueOnce([{ action: 'CREATE', _count: { _all: 6 } }])
      .mockResolvedValueOnce([{ category: 'SECURITY', _count: { _all: 4 } }])
      .mockResolvedValueOnce([{ severity: 'HIGH', _count: { _all: 2 } }]);
    prisma.loginAudit.groupBy.mockResolvedValue([
      { success: true, _count: { _all: 3 } },
      { success: false, _count: { _all: 1 } },
    ]);
    prisma.aPIAuditLog.count.mockResolvedValue(5);

    const result = await service.complianceReport('tenant-1', {
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
      includeCategories: ['SECURITY'],
    } as any);

    expect(result.totalLogs).toBe(10);
    expect(result.byAction).toEqual({ CREATE: 6 });
    expect(result.byCategory).toEqual({ SECURITY: 4 });
    expect(result.bySeverity).toEqual({ HIGH: 2 });
    expect(result.loginStats).toEqual({ success: 3, failed: 1 });
    expect(result.apiErrors).toBe(5);
  });

  it('returns user activity with user map', async () => {
    prisma.auditLog.groupBy.mockResolvedValue([
      { userId: 'u1', _count: { _all: 4 }, _max: { createdAt: new Date('2025-01-05') } },
      { userId: null, _count: { _all: 2 }, _max: { createdAt: new Date('2025-01-06') } },
    ]);
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', firstName: 'Ava', lastName: 'Smith', email: 'a@example.com' },
    ]);

    const result = await service.userActivityReport('tenant-1', {
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
    } as any);

    expect(result.users.length).toBe(2);
    expect(result.users[0].user?.name).toBe('Ava Smith');
    expect(result.users[1].user).toBeNull();
  });

  it('performs advanced search with filters', async () => {
    prisma.auditLog.findMany.mockResolvedValue([{ id: 'a1' }]);
    prisma.auditLog.count.mockResolvedValue(1);

    const result = await service.advancedSearch('tenant-1', {
      page: 2,
      limit: 25,
      actions: ['CREATE'],
      entityTypes: ['LOAD'],
      userIds: ['u1'],
      searchText: 'load',
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
    } as any);

    expect(result.total).toBe(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 25,
        skip: 25,
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          action: { in: ['CREATE'] },
          entityType: { in: ['LOAD'] },
          userId: { in: ['u1'] },
          OR: expect.any(Array),
          createdAt: expect.any(Object),
        }),
      }),
    );
  });
});