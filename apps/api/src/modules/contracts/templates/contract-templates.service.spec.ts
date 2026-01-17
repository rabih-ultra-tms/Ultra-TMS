import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContractTemplatesService } from './contract-templates.service';
import { PrismaService } from '../../../prisma.service';

describe('ContractTemplatesService', () => {
  let service: ContractTemplatesService;
  let prisma: {
    contractTemplate: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      contractTemplate: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractTemplatesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ContractTemplatesService);
  });

  it('lists templates excluding deleted', async () => {
    const rows = [{ id: 'tpl-1' }];
    prisma.contractTemplate.findMany.mockResolvedValue(rows);

    const result = await service.list('tenant-1');

    expect(result).toEqual(rows);
    expect(prisma.contractTemplate.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('throws when template not found', async () => {
    prisma.contractTemplate.findFirst.mockResolvedValue(null);

    await expect(service.detail('tenant-1', 'tpl-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns template details', async () => {
    prisma.contractTemplate.findFirst.mockResolvedValue({ id: 'tpl-1' });

    const result = await service.detail('tenant-1', 'tpl-1');

    expect(result).toEqual({ id: 'tpl-1' });
  });

  it('creates template with defaults', async () => {
    prisma.contractTemplate.create.mockResolvedValue({ id: 'tpl-1' });

    await service.create('tenant-1', 'user-1', {
      templateName: 'Name',
      contractType: 'STANDARD',
      templateContent: '<html />',
    } as any);

    expect(prisma.contractTemplate.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        templateName: 'Name',
        contractType: 'STANDARD',
        templateContent: '<html />',
        defaultTerms: null,
        isActive: true,
        createdById: 'user-1',
      },
    });
  });

  it('creates template with explicit values', async () => {
    prisma.contractTemplate.create.mockResolvedValue({ id: 'tpl-2' });

    await service.create('tenant-1', 'user-1', {
      templateName: 'Name',
      contractType: 'STANDARD',
      templateContent: '<html />',
      defaultTerms: 'Net 30',
      isActive: false,
    } as any);

    expect(prisma.contractTemplate.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        templateName: 'Name',
        contractType: 'STANDARD',
        templateContent: '<html />',
        defaultTerms: 'Net 30',
        isActive: false,
        createdById: 'user-1',
      },
    });
  });

  it('updates template after detail', async () => {
    prisma.contractTemplate.findFirst.mockResolvedValue({ id: 'tpl-1' });
    prisma.contractTemplate.update.mockResolvedValue({ id: 'tpl-1', templateName: 'New' });

    const result = await service.update('tenant-1', 'tpl-1', { templateName: 'New' } as any);

    expect(prisma.contractTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpl-1' },
      data: { templateName: 'New' },
    });
    expect(result.templateName).toBe('New');
  });

  it('soft deletes template', async () => {
    prisma.contractTemplate.findFirst.mockResolvedValue({ id: 'tpl-1' });
    prisma.contractTemplate.update.mockResolvedValue({ id: 'tpl-1' });

    const result = await service.delete('tenant-1', 'tpl-1');

    expect(prisma.contractTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpl-1' },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result).toEqual({ success: true });
  });

  it('clones template with copy name', async () => {
    prisma.contractTemplate.findFirst.mockResolvedValue({
      id: 'tpl-1',
      templateName: 'Base',
      contractType: 'STANDARD',
      templateContent: '<html />',
      defaultTerms: null,
      isActive: true,
    });

    prisma.contractTemplate.create.mockResolvedValue({ id: 'tpl-2' });

    await service.clone('tenant-1', 'tpl-1', 'user-1');

    expect(prisma.contractTemplate.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        templateName: 'Base Copy',
        contractType: 'STANDARD',
        templateContent: '<html />',
        defaultTerms: null,
        isActive: true,
        createdById: 'user-1',
      },
    });
  });
});
