import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../../prisma.service';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prisma: {
    communicationTemplate: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      communicationTemplate: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TemplatesService);
  });

  it('throws conflict when creating duplicate template', async () => {
    prisma.communicationTemplate.findUnique.mockResolvedValue({ id: 'tmpl-1' });

    await expect(
      service.create('tenant-1', 'user-1', {
        name: 'Welcome',
        code: 'WELCOME_USER',
        channel: 'EMAIL',
        bodyEn: 'Hi',
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('creates template with defaults', async () => {
    prisma.communicationTemplate.findUnique.mockResolvedValue(null);
    prisma.communicationTemplate.create.mockResolvedValue({ id: 'tmpl-1' });

    await service.create('tenant-1', 'user-1', {
      name: 'Welcome',
      code: 'WELCOME_USER',
      channel: 'EMAIL',
      bodyEn: 'Hello',
    } as any);

    expect(prisma.communicationTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          code: 'WELCOME_USER',
          isSystem: false,
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('findAll applies filters and search', async () => {
    prisma.communicationTemplate.findMany.mockResolvedValue([]);
    prisma.communicationTemplate.count.mockResolvedValue(0);

    await service.findAll('tenant-1', {
      channel: 'EMAIL',
      category: 'SYSTEM',
      status: 'ACTIVE',
      search: 'welcome',
    });

    expect(prisma.communicationTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 'tenant-1',
          channel: 'EMAIL',
          category: 'SYSTEM',
          status: 'ACTIVE',
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it('throws when template not found', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue(null);

    await expect(service.findOne('tenant-1', 'tmpl-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('prevents update when code/channel conflict exists', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue({
      id: 'tmpl-1',
      code: 'CODE1',
      channel: 'EMAIL',
    });
    prisma.communicationTemplate.findUnique.mockResolvedValue({ id: 'tmpl-2' });

    await expect(
      service.update('tenant-1', 'tmpl-1', {
        code: 'CODE2',
        channel: 'SMS',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('blocks deleting system templates', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue({
      id: 'tmpl-1',
      isSystem: true,
    });

    await expect(service.delete('tenant-1', 'tmpl-1')).rejects.toThrow(
      ConflictException,
    );
  });

  it('deletes non-system templates', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue({
      id: 'tmpl-1',
      code: 'CODE1',
      isSystem: false,
    });
    prisma.communicationTemplate.delete.mockResolvedValue({ id: 'tmpl-1' });

    await service.delete('tenant-1', 'tmpl-1');

    expect(prisma.communicationTemplate.delete).toHaveBeenCalledWith({
      where: { id: 'tmpl-1' },
    });
  });

  it('clones template with unique code', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue({
      id: 'tmpl-1',
      name: 'Original',
      code: 'CODE1',
      description: 'Desc',
      category: 'SYSTEM',
      channel: 'EMAIL',
      subjectEn: 'Sub',
      subjectEs: null,
      bodyEn: 'Body',
      bodyEs: null,
      fromName: 'Team',
      fromEmail: 'team@example.com',
      replyTo: 'reply@example.com',
    });
    prisma.communicationTemplate.findUnique
      .mockResolvedValueOnce({ id: 'existing' })
      .mockResolvedValueOnce(null);
    prisma.communicationTemplate.create.mockResolvedValue({ id: 'tmpl-2' });

    await service.clone('tenant-1', 'tmpl-1', 'user-1');

    expect(prisma.communicationTemplate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: 'CODE1_COPY_1',
          isSystem: false,
          createdById: 'user-1',
        }),
      }),
    );
  });

  it('previews rendered subject/body', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue({
      id: 'tmpl-1',
      channel: 'EMAIL',
      subjectEn: 'Hello {{user.name}}',
      subjectEs: null,
      bodyEn: 'Load {{load.id}}',
      bodyEs: null,
    });

    const result = await service.preview('tenant-1', 'tmpl-1', {
      user: { name: 'Ava' },
      load: { id: 'LD-1' },
    });

    expect(result.subject).toBe('Hello Ava');
    expect(result.body).toBe('Load LD-1');
  });
});