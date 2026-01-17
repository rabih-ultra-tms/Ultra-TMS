import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreditApplicationsService } from './credit-applications.service';
import { PrismaService } from '../../../prisma.service';

describe('CreditApplicationsService', () => {
  let service: CreditApplicationsService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      creditApplication: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      creditLimit: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      company: { findFirst: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditApplicationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(CreditApplicationsService);
  });

  it('throws when company missing on create', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(service.create('tenant-1', 'user-1', { companyId: 'c1' } as any)).rejects.toThrow(NotFoundException);
  });

  it('creates credit application', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditApplication.count.mockResolvedValue(0);
    prisma.creditApplication.create.mockResolvedValue({ id: 'app1' });

    await service.create('tenant-1', 'user-1', { companyId: 'c1', businessName: 'Biz', requestedLimit: 1000 } as any);

    expect(prisma.creditApplication.create).toHaveBeenCalled();
  });

  it('creates application with custom fields', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditApplication.count.mockResolvedValue(0);
    prisma.creditApplication.create.mockResolvedValue({ id: 'app1' });

    await service.create('tenant-1', 'user-1', {
      companyId: 'c1',
      businessName: 'Biz',
      requestedLimit: 1000,
      requestedTerms: 'NET45',
      submittedAt: '2026-01-01',
    } as any);

    expect(prisma.creditApplication.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ customFields: expect.any(Object) }) }),
    );
  });

  it('prevents update for approved application', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'APPROVED' });

    await expect(service.update('tenant-1', 'user-1', 'app1', {} as any)).rejects.toThrow(BadRequestException);
  });

  it('updates application and merges custom fields', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({
      id: 'app1',
      status: 'PENDING',
      companyId: 'c1',
      customFields: { requestedTerms: 'NET30' },
    });
    prisma.company.findFirst.mockResolvedValue({ id: 'c2' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });

    await service.update('tenant-1', 'user-1', 'app1', {
      companyId: 'c2',
      requestedTerms: 'NET45',
      submittedAt: '2026-01-01',
    } as any);

    expect(prisma.creditApplication.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          company: { connect: { id: 'c2' } },
          customFields: expect.objectContaining({ requestedTerms: 'NET45', submittedAt: '2026-01-01' }),
        }),
      }),
    );
  });

  it('rejects update when company not found', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING', companyId: 'c1' });
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(
      service.update('tenant-1', 'user-1', 'app1', { companyId: 'c2' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('submits application and emits event', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING', companyId: 'c1' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });

    await service.submit('tenant-1', 'app1', 'user-1');

    expect(events.emit).toHaveBeenCalledWith('credit.application.submitted', expect.objectContaining({ applicationId: 'app1' }));
  });

  it('rejects submit when status not pending', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'APPROVED' });

    await expect(service.submit('tenant-1', 'app1', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('approves application and upserts credit limit', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING', companyId: 'c1' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });
    prisma.creditLimit.findFirst.mockResolvedValue(null);
    prisma.creditLimit.create.mockResolvedValue({ id: 'limit1' });

    await service.approve('tenant-1', 'app1', 'user-1', { approvedLimit: 2000 } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.application.approved', expect.objectContaining({ applicationId: 'app1' }));
  });

  it('rejects approve when status not reviewable', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'DENIED', companyId: 'c1' });

    await expect(service.approve('tenant-1', 'app1', 'user-1', { approvedLimit: 2000 } as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('updates existing credit limit and marks exceeded', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING', companyId: 'c1' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });
    prisma.creditLimit.findFirst.mockResolvedValue({ id: 'limit1', usedCredit: 500, creditLimit: 1000, paymentTerms: 'NET30' });
    prisma.creditLimit.update.mockResolvedValue({ id: 'limit1' });

    await service.approve('tenant-1', 'app1', 'user-1', { approvedLimit: 200, paymentTerms: 'NET15' } as any);

    expect(prisma.creditLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'EXCEEDED', creditLimit: 200, paymentTerms: 'NET15' }),
      }),
    );
  });

  it('updates existing credit limit and keeps active', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING', companyId: 'c1' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });
    prisma.creditLimit.findFirst.mockResolvedValue({ id: 'limit1', usedCredit: 50, creditLimit: 100, paymentTerms: 'NET30' });
    prisma.creditLimit.update.mockResolvedValue({ id: 'limit1' });

    await service.approve('tenant-1', 'app1', 'user-1', { approvedLimit: 200 } as any);

    expect(prisma.creditLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE', creditLimit: 200 }) }),
    );
  });

  it('rejects application and emits event', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING', companyId: 'c1' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });

    await service.reject('tenant-1', 'app1', 'user-1', { reason: 'Bad credit' } as any);

    expect(events.emit).toHaveBeenCalledWith('credit.application.rejected', expect.objectContaining({ applicationId: 'app1' }));
  });

  it('deletes pending application', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'PENDING' });
    prisma.creditApplication.update.mockResolvedValue({ id: 'app1' });

    const result = await service.delete('tenant-1', 'user-1', 'app1');

    expect(result.success).toBe(true);
  });

  it('rejects delete when status not pending', async () => {
    prisma.creditApplication.findFirst.mockResolvedValue({ id: 'app1', status: 'APPROVED' });

    await expect(service.delete('tenant-1', 'user-1', 'app1')).rejects.toThrow(BadRequestException);
  });

  it('generateApplicationNumber throws after retries', async () => {
    prisma.creditApplication.count.mockResolvedValue(1);

    await expect((service as any).generateApplicationNumber('tenant-1', 4)).rejects.toThrow(BadRequestException);
  });

  it('retries application number generation on collision', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.creditApplication.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    prisma.creditApplication.create.mockResolvedValue({ id: 'app1' });

    await service.create('tenant-1', 'user-1', { companyId: 'c1', businessName: 'Biz', requestedLimit: 1000 } as any);

    expect(prisma.creditApplication.create).toHaveBeenCalled();
  });
});
