import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { PrismaService } from '../../../prisma.service';

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = { communicationTemplate: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailTemplatesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(EmailTemplatesService);
  });

  it('lists templates', async () => {
    prisma.communicationTemplate.findMany.mockResolvedValue([]);

    const result = await service.list('t1');

    expect(result).toEqual([]);
  });

  it('throws when template missing', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'e1')).rejects.toThrow(NotFoundException);
  });

  it('updates template', async () => {
    prisma.communicationTemplate.findFirst.mockResolvedValue({ id: 'e1' });
    prisma.communicationTemplate.update.mockResolvedValue({ id: 'e1', subjectEn: 'Hi' });

    const result = await service.update('t1', 'e1', { subject: 'Hi', body: 'Body', isActive: true } as any, 'u1');

    expect(result.subjectEn).toBe('Hi');
  });
});
