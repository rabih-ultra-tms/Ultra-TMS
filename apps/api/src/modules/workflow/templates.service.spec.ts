import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../../prisma.service';

describe('Workflow TemplatesService', () => {
  let service: TemplatesService;
  let prisma: {
    workflowTemplate: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    workflow: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      workflowTemplate: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      workflow: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TemplatesService);
  });

  it('lists templates', async () => {
    prisma.workflowTemplate.findMany.mockResolvedValue([]);

    await service.findAll('tenant-1');

    expect(prisma.workflowTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 'tenant-1', deletedAt: null } }),
    );
  });

  it('throws when template not found', async () => {
    prisma.workflowTemplate.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('creates template', async () => {
    prisma.workflowTemplate.create.mockResolvedValue({ id: 't1', isSystem: false, isActive: true });

    await service.create('tenant-1', 'user-1', {
      templateName: 'Temp',
      triggerConfig: {},
      stepsJson: [],
    } as any);

    expect(prisma.workflowTemplate.create).toHaveBeenCalled();
  });

  it('updates template', async () => {
    prisma.workflowTemplate.findFirst.mockResolvedValue({ id: 't1' });
    prisma.workflowTemplate.update.mockResolvedValue({ id: 't1', isSystem: false, isActive: true });

    await service.update('tenant-1', 't1', { templateName: 'Updated' } as any);

    expect(prisma.workflowTemplate.update).toHaveBeenCalled();
  });

  it('soft deletes template', async () => {
    prisma.workflowTemplate.findFirst.mockResolvedValue({ id: 't1' });
    prisma.workflowTemplate.update.mockResolvedValue({ id: 't1' });

    const result = await service.delete('tenant-1', 't1');

    expect(result).toEqual({ success: true });
  });

  it('creates workflow from template and updates template', async () => {
    prisma.workflowTemplate.findFirst.mockResolvedValue({
      id: 't1',
      description: 'Desc',
      triggerConfig: { type: 'MANUAL', eventName: 'e1' },
      stepsJson: [{ stepNumber: 1, stepType: 'ACTION' }],
      isActive: true,
    });
    prisma.workflow.create.mockResolvedValue({ id: 'w1' });
    prisma.workflowTemplate.update.mockResolvedValue({ id: 't1' });

    const result = await service.createWorkflowFromTemplate('tenant-1', 'user-1', 't1', {
      name: 'WF',
      activate: true,
    } as any);

    expect(result).toEqual({ workflowId: 'w1' });
    expect(prisma.workflow.create).toHaveBeenCalled();
    expect(prisma.workflowTemplate.update).toHaveBeenCalled();
  });
});