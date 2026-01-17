import { Test, TestingModule } from '@nestjs/testing';
import { WidgetsService } from './widgets.service';
import { PrismaService } from '../../../prisma.service';

describe('WidgetsService', () => {
  let service: WidgetsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      feedbackWidget: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WidgetsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(WidgetsService);
  });

  it('lists widgets', async () => {
    prisma.feedbackWidget.findMany.mockResolvedValue([{ id: 'w1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 'w1' }]);
    expect(prisma.feedbackWidget.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('creates widget', async () => {
    prisma.feedbackWidget.create.mockResolvedValue({ id: 'w1' });

    const result = await service.create('t1', {
      name: 'Widget',
      description: 'desc',
      placement: 'DASHBOARD',
      pages: ['home'],
      widgetType: 'FORM',
      config: { theme: 'light' },
      triggerRules: { delay: 3 },
      isActive: false,
    } as any);

    expect(result.id).toBe('w1');
    expect(prisma.feedbackWidget.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: 't1',
        name: 'Widget',
        isActive: false,
      }),
    });
  });
});
