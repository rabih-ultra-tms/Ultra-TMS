import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FactoringCompaniesService } from './factoring-companies.service';
import { PrismaService } from '../../../prisma.service';
import { FactoringCompanyStatus } from '../dto/enums';

describe('FactoringCompaniesService', () => {
  let service: FactoringCompaniesService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      factoringCompany: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn(), update: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FactoringCompaniesService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(FactoringCompaniesService);
  });

  it('rejects duplicate company code', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1' });

    await expect(service.create('t1', 'u1', { companyCode: 'FC' } as any)).rejects.toThrow(BadRequestException);
  });

  it('creates company and emits event', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue(null);
    prisma.factoringCompany.create.mockResolvedValue({ id: 'f1' });

    const result = await service.create('t1', 'u1', { companyCode: 'FC', name: 'Factor' } as any);

    expect(result.id).toBe('f1');
    expect(events.emit).toHaveBeenCalledWith('factoring.company.created', expect.any(Object));
  });

  it('creates company with default values', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue(null);
    prisma.factoringCompany.create.mockResolvedValue({ id: 'f2' });

    await service.create('t1', 'u1', { companyCode: 'FC2', name: 'Factor' } as any);

    expect(prisma.factoringCompany.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        verificationMethod: 'EMAIL',
        verificationSLAHours: 24,
        status: FactoringCompanyStatus.ACTIVE,
      }),
    });
  });

  it('lists companies with pagination', async () => {
    prisma.factoringCompany.findMany.mockResolvedValue([]);
    prisma.factoringCompany.count.mockResolvedValue(0);

    const result = await service.findAll('t1', {} as any);

    expect(result.total).toBe(0);
  });

  it('lists companies with status and search filters', async () => {
    prisma.factoringCompany.findMany.mockResolvedValue([{ id: 'f1' }]);
    prisma.factoringCompany.count.mockResolvedValue(1);

    const result = await service.findAll('t1', { status: FactoringCompanyStatus.INACTIVE, search: 'fact', page: 2, limit: 5 } as any);

    expect(prisma.factoringCompany.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tenantId: 't1',
        deletedAt: null,
        status: FactoringCompanyStatus.INACTIVE,
        OR: [
          { name: { contains: 'fact', mode: 'insensitive' } },
          { companyCode: { contains: 'fact', mode: 'insensitive' } },
        ],
      }),
      skip: 5,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    expect(result.totalPages).toBe(1);
  });

  it('throws when company missing', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'f1')).rejects.toThrow(NotFoundException);
  });

  it('toggles status', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1', status: FactoringCompanyStatus.ACTIVE });
    prisma.factoringCompany.update.mockResolvedValue({ id: 'f1', status: FactoringCompanyStatus.INACTIVE });

    const result = await service.toggleStatus('t1', 'u1', 'f1');

    expect(result.status).toBe(FactoringCompanyStatus.INACTIVE);
  });

  it('sets explicit status', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1', status: FactoringCompanyStatus.INACTIVE });
    prisma.factoringCompany.update.mockResolvedValue({ id: 'f1', status: FactoringCompanyStatus.ACTIVE });

    const result = await service.toggleStatus('t1', 'u1', 'f1', FactoringCompanyStatus.ACTIVE);

    expect(result.status).toBe(FactoringCompanyStatus.ACTIVE);
  });

  it('updates company without code change', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1', companyCode: 'FC' });
    prisma.factoringCompany.update.mockResolvedValue({ id: 'f1', name: 'Updated' });

    const result = await service.update('t1', 'u1', 'f1', { name: 'Updated' } as any);

    expect(prisma.factoringCompany.update).toHaveBeenCalledWith({
      where: { id: 'f1' },
      data: expect.objectContaining({ name: 'Updated', updatedById: 'u1' }),
    });
    expect(result.name).toBe('Updated');
  });

  it('rejects update on company code conflict', async () => {
    prisma.factoringCompany.findFirst
      .mockResolvedValueOnce({ id: 'f1', companyCode: 'FC' })
      .mockResolvedValueOnce({ id: 'f2', companyCode: 'FC2' });

    await expect(service.update('t1', 'u1', 'f1', { companyCode: 'FC2' } as any)).rejects.toThrow(BadRequestException);
  });

  it('removes company', async () => {
    prisma.factoringCompany.findFirst.mockResolvedValue({ id: 'f1' });
    prisma.factoringCompany.update.mockResolvedValue({ id: 'f1' });

    const result = await service.remove('t1', 'u1', 'f1');

    expect(result.success).toBe(true);
  });
});
