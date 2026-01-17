import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { PrismaService } from '../../../prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('SurveysService', () => {
  let service: SurveysService;
  let prisma: any;
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      survey: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      surveyResponse: {
        create: jest.fn(),
      },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SurveysService, { provide: PrismaService, useValue: prisma }, { provide: EventEmitter2, useValue: events }],
    }).compile();

    service = module.get(SurveysService);
  });

  it('lists surveys', async () => {
    prisma.survey.findMany.mockResolvedValue([{ id: 's1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 's1' }]);
  });

  it('throws when survey missing', async () => {
    prisma.survey.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 's1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates survey', async () => {
    prisma.survey.create.mockResolvedValue({ id: 's1' });

    const result = await service.create('t1', 'u1', {
      title: 'Survey',
      description: 'desc',
      surveyType: 'CSAT',
      questions: [{ id: 'q1', required: true }],
      anonymous: true,
      requireAllQuestions: true,
      showProgress: false,
      thankYouMessage: 'thanks',
      redirectUrl: 'https://example.com',
      triggerEvent: 'order.completed',
      targetSegment: { tier: 'gold' },
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-02T00:00:00.000Z',
    } as any);

    expect(result.id).toBe('s1');
    expect(prisma.survey.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Survey',
        status: 'DRAFT',
        anonymous: true,
        requireAllQuestions: true,
        showProgress: false,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
    });
  });

  it('updates survey', async () => {
    prisma.survey.findFirst.mockResolvedValue({ id: 's1' });
    prisma.survey.update.mockResolvedValue({ id: 's1' });

    await service.update('t1', 's1', {
      title: 'Updated',
      description: 'desc',
      surveyType: 'CSAT',
      questions: [{ id: 'q1' }],
      anonymous: false,
      requireAllQuestions: false,
      showProgress: true,
      thankYouMessage: 'thanks',
      redirectUrl: null,
      triggerEvent: null,
      targetSegment: null,
      status: 'ACTIVE',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-02T00:00:00.000Z',
    } as any);

    expect(prisma.survey.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: expect.objectContaining({
        title: 'Updated',
        status: 'ACTIVE',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      }),
    });
  });

  it('rejects missing required answers', async () => {
    prisma.survey.findFirst.mockResolvedValue({
      id: 's1',
      anonymous: false,
      requireAllQuestions: false,
      questions: [{ id: 'q1', required: true }],
    });

    await expect(
      service.submitResponse('t1', 's1', 'u1', { answers: {} } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when all questions required but missing', async () => {
    prisma.survey.findFirst.mockResolvedValue({
      id: 's1',
      anonymous: false,
      requireAllQuestions: true,
      questions: [{ id: 'q1' }, { id: 'q2' }],
    });

    await expect(
      service.submitResponse('t1', 's1', 'u1', { answers: { q1: 'a1' } } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('submits response and increments count', async () => {
    prisma.survey.findFirst.mockResolvedValue({
      id: 's1',
      anonymous: false,
      requireAllQuestions: false,
      questions: [{ id: 'q1' }],
    });
    prisma.surveyResponse.create.mockResolvedValue({ id: 'r1' });

    const result = await service.submitResponse('t1', 's1', 'u1', {
      answers: { q1: 'a1' },
      completionPercentage: 100,
    } as any);

    expect(result.id).toBe('r1');
    expect(prisma.surveyResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        surveyId: 's1',
        userId: 'u1',
      }),
    });
    expect(prisma.survey.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { responseCount: { increment: 1 } },
    });
    expect(events.emit).toHaveBeenCalledWith('survey.response.submitted', {
      surveyId: 's1',
      responseId: 'r1',
    });
  });

  it('increments sent count for order.completed', async () => {
    await service.handleOrderCompleted({ tenantId: 't1' });

    expect(prisma.survey.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 't1', triggerEvent: 'order.completed', status: 'ACTIVE' },
      data: { sentCount: { increment: 1 } },
    });
  });

  it('increments sent count for user.onboarded', async () => {
    await service.handleUserOnboarded({ tenantId: 't1' });

    expect(prisma.survey.updateMany).toHaveBeenCalledWith({
      where: { tenantId: 't1', triggerEvent: 'user.onboarded', status: 'ACTIVE' },
      data: { sentCount: { increment: 1 } },
    });
  });
});
