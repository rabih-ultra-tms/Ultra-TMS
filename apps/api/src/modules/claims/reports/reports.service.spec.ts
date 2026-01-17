import { Test, TestingModule } from '@nestjs/testing';
import { ClaimsReportsService } from './reports.service';
import { PrismaService } from '../../../prisma.service';

describe('ClaimsReportsService', () => {
  let service: ClaimsReportsService;
  let prisma: {
    claim: {
      groupBy: jest.Mock;
      aggregate: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      claim: {
        groupBy: jest.fn(),
        aggregate: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClaimsReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ClaimsReportsService);
  });

  it('returns status summary', async () => {
    prisma.claim.groupBy.mockResolvedValue([
      { status: 'DRAFT', _count: { _all: 2 } },
    ]);

    const result = await service.statusSummary('tenant-1');

    expect(result).toEqual([{ status: 'DRAFT', count: 2 }]);
  });

  it('returns type summary', async () => {
    prisma.claim.groupBy.mockResolvedValue([
      { claimType: 'DAMAGE', _count: { _all: 3 } },
    ]);

    const result = await service.typeSummary('tenant-1');

    expect(result).toEqual([{ claimType: 'DAMAGE', count: 3 }]);
  });

  it('returns financial aggregates', async () => {
    prisma.claim.aggregate.mockResolvedValue({
      _sum: { claimedAmount: 100, approvedAmount: 60, paidAmount: 40 },
    });

    const result = await service.financials('tenant-1');

    expect(result).toEqual({ claimed: 100, approved: 60, paid: 40 });
  });

  it('returns overdue count', async () => {
    prisma.claim.count.mockResolvedValue(5);

    const result = await service.overdue('tenant-1');

    expect(result).toEqual({ overdue: 5 });
  });
});