import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EdiMappingsService } from './edi-mappings.service';
import { PrismaService } from '../../../prisma.service';

describe('EdiMappingsService', () => {
  let service: EdiMappingsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      ediTransactionMapping: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EdiMappingsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(EdiMappingsService);
  });

  it('lists mappings with filters', async () => {
    prisma.ediTransactionMapping.findMany.mockResolvedValue([{ id: 'm1' }]);

    const result = await service.list('t1', { tradingPartnerId: 'tp1', transactionType: 'EDI_204' });

    expect(result).toEqual([{ id: 'm1' }]);
    expect(prisma.ediTransactionMapping.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ tenantId: 't1', tradingPartnerId: 'tp1', transactionType: 'EDI_204' }),
      orderBy: { createdAt: 'desc' },
    });
  });

  it('throws on duplicate mapping', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue({ id: 'm1' });

    await expect(
      service.create('t1', 'u1', { tradingPartnerId: 'tp1', transactionType: 'EDI_204', fieldMappings: {} } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates mapping with defaults', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue(null);
    prisma.ediTransactionMapping.create.mockResolvedValue({ id: 'm1' });

    const result = await service.create('t1', 'u1', {
      tradingPartnerId: 'tp1',
      transactionType: 'EDI_204',
      fieldMappings: { a: 'b' },
      isActive: false,
    } as any);

    expect(result.id).toBe('m1');
    expect(prisma.ediTransactionMapping.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 't1',
        tradingPartnerId: 'tp1',
        transactionType: 'EDI_204',
        isActive: false,
      }),
    });
  });

  it('creates mapping with explicit defaults', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue(null);
    prisma.ediTransactionMapping.create.mockResolvedValue({ id: 'm2' });

    await service.create('t1', 'u1', {
      tradingPartnerId: 'tp1',
      transactionType: 'EDI_204',
      fieldMappings: { a: 'b' },
      defaultValues: { mode: 'AIR' },
      transformRules: { rule: 'x' },
      validationRules: { rule: 'y' },
    } as any);

    expect(prisma.ediTransactionMapping.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          defaultValues: expect.anything(),
          transformRules: expect.anything(),
          validationRules: expect.anything(),
        }),
      }),
    );
  });

  it('updates mapping fields', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue({ id: 'm1' });
    prisma.ediTransactionMapping.update.mockResolvedValue({ id: 'm1', isActive: true });

    const result = await service.update('t1', 'u1', 'm1', { isActive: true } as any);

    expect(result.isActive).toBe(true);
    expect(prisma.ediTransactionMapping.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: expect.objectContaining({ isActive: true, updatedById: 'u1' }),
    });
  });

  it('updates mapping with null optional fields', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue({ id: 'm1' });
    prisma.ediTransactionMapping.update.mockResolvedValue({ id: 'm1' });

    await service.update('t1', 'u1', 'm1', { defaultValues: null, transformRules: null, validationRules: null } as any);

    expect(prisma.ediTransactionMapping.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ updatedById: 'u1' }),
      }),
    );
  });

  it('throws when mapping missing', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'm1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('soft deletes mapping', async () => {
    prisma.ediTransactionMapping.findFirst.mockResolvedValue({ id: 'm1' });

    const result = await service.remove('t1', 'u1', 'm1');

    expect(result).toEqual({ success: true });
    expect(prisma.ediTransactionMapping.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: expect.objectContaining({ isActive: false, updatedById: 'u1' }),
    });
  });
});
