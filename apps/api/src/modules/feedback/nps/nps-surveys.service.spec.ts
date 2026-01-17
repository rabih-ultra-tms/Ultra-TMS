import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NpsSurveysService } from './nps-surveys.service';
import { PrismaService } from '../../../prisma.service';
import { NpsScoreService } from './nps-score.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('NpsSurveysService', () => {
  let service: NpsSurveysService;
  let prisma: any;
  let npsScore: { categorizeScore: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      nPSSurvey: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      nPSResponse: {
        create: jest.fn(),
      },
    };
    npsScore = { categorizeScore: jest.fn() };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NpsSurveysService,
        { provide: PrismaService, useValue: prisma },
        { provide: NpsScoreService, useValue: npsScore },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(NpsSurveysService);
  });

  it('lists surveys', async () => {
    prisma.nPSSurvey.findMany.mockResolvedValue([{ id: 's1' }]);

    const result = await service.list('t1');

    expect(result).toEqual([{ id: 's1' }]);
  });

  it('throws when survey missing', async () => {
    prisma.nPSSurvey.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 's1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates survey with dates', async () => {
    prisma.nPSSurvey.create.mockResolvedValue({ id: 's1' });

    const result = await service.create('t1', 'u1', {
      surveyNumber: 'NPS-1',
      question: 'How likely?',
      followUpQuestion: 'Why?',
      targetType: 'CUSTOMER',
      scheduledAt: '2024-01-01T00:00:00.000Z',
      expiresAt: '2024-02-01T00:00:00.000Z',
    } as any);

    expect(result.id).toBe('s1');
    expect(prisma.nPSSurvey.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        scheduledAt: expect.any(Date),
        expiresAt: expect.any(Date),
        status: 'DRAFT',
      }),
    });
  });

  it('updates survey', async () => {
    prisma.nPSSurvey.findFirst.mockResolvedValue({ id: 's1' });
    prisma.nPSSurvey.update.mockResolvedValue({ id: 's1' });

    await service.update('t1', 's1', {
      surveyNumber: 'NPS-2',
      question: 'Q',
      followUpQuestion: 'F',
      targetType: 'CARRIER',
      scheduledAt: '2024-01-01T00:00:00.000Z',
      expiresAt: '2024-02-01T00:00:00.000Z',
      status: 'ACTIVE',
    } as any);

    expect(prisma.nPSSurvey.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: expect.objectContaining({
        scheduledAt: expect.any(Date),
        expiresAt: expect.any(Date),
        status: 'ACTIVE',
      }),
    });
  });

  it('activates survey', async () => {
    prisma.nPSSurvey.findFirst.mockResolvedValue({ id: 's1' });
    prisma.nPSSurvey.update.mockResolvedValue({ id: 's1', status: 'ACTIVE' });

    const result = await service.activate('t1', 's1');

    expect(result.status).toBe('ACTIVE');
    expect(prisma.nPSSurvey.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: expect.objectContaining({ status: 'ACTIVE', scheduledAt: expect.any(Date) }),
    });
  });

  it('rejects submit when survey is draft', async () => {
    prisma.nPSSurvey.findFirst.mockResolvedValue({ id: 's1', status: 'DRAFT' });

    await expect(
      service.submitResponse('t1', null, {
        surveyId: 's1',
        score: 2,
        respondentType: 'CUSTOMER',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('submits response and emits event', async () => {
    prisma.nPSSurvey.findFirst.mockResolvedValue({ id: 's1', status: 'ACTIVE' });
    npsScore.categorizeScore.mockReturnValue('PROMOTER');
    prisma.nPSResponse.create.mockResolvedValue({ id: 'r1' });

    const result = await service.submitResponse('t1', 'u1', {
      surveyId: 's1',
      score: 9,
      respondentType: 'CUSTOMER',
      respondentEmail: 'a@example.com',
      feedback: 'great',
    } as any);

    expect(result.id).toBe('r1');
    expect(prisma.nPSResponse.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        surveyId: 's1',
        score: 9,
        category: 'PROMOTER',
      }),
    });
    expect(events.emit).toHaveBeenCalledWith('nps.response.submitted', {
      surveyId: 's1',
      score: 9,
      category: 'PROMOTER',
    });
  });
});
