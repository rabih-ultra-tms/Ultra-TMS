import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../../../prisma.service';
import { JobsService } from '../jobs/jobs.service';

describe('Scheduler TemplatesService', () => {
  let service: TemplatesService;
  let prisma: any;
  let jobs: { create: jest.Mock };

  beforeEach(async () => {
    prisma = { jobTemplate: { findMany: jest.fn(), findUnique: jest.fn() } };
    jobs = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesService, { provide: PrismaService, useValue: prisma }, { provide: JobsService, useValue: jobs }],
    }).compile();

    service = module.get(TemplatesService);
  });

  it('lists templates', async () => {
    prisma.jobTemplate.findMany.mockResolvedValue([]);

    const result = await service.list();

    expect(result).toEqual([]);
  });

  it('throws when template missing', async () => {
    prisma.jobTemplate.findUnique.mockResolvedValue(null);

    await expect(service.get('code')).rejects.toThrow(NotFoundException);
  });

  it('creates job from template', async () => {
    prisma.jobTemplate.findUnique.mockResolvedValue({ code: 'job', name: 'Job', handler: 'handler', defaultParameters: { a: 1 } });
    jobs.create.mockResolvedValue({ id: 'j1' });

    const result = await service.createFromTemplate('job', {}, 'tenant-1', 'user-1');

    expect(result).toEqual({ id: 'j1' });
    expect(jobs.create).toHaveBeenCalled();
  });
});
