import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSurveyDto, SubmitSurveyResponseDto, UpdateSurveyDto } from '../dto/feedback.dto';

interface SurveyQuestion {
  id: string;
  required?: boolean;
}

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventEmitter2) {}

  async list(tenantId: string) {
    return this.prisma.survey.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const survey = await this.prisma.survey.findFirst({ where: { id, tenantId } });
    if (!survey) throw new NotFoundException('Survey not found');
    return survey;
  }

  async create(tenantId: string, userId: string, dto: CreateSurveyDto) {
    return this.prisma.survey.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        surveyType: dto.surveyType,
        questions: dto.questions as unknown as Prisma.InputJsonValue,
        anonymous: dto.anonymous ?? false,
        requireAllQuestions: dto.requireAllQuestions ?? false,
        showProgress: dto.showProgress ?? true,
        thankYouMessage: dto.thankYouMessage,
        redirectUrl: dto.redirectUrl,
        triggerEvent: dto.triggerEvent,
        targetSegment: dto.targetSegment as unknown as Prisma.InputJsonValue | undefined,
        status: 'DRAFT',
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSurveyDto) {
    await this.findOne(tenantId, id);
    return this.prisma.survey.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        surveyType: dto.surveyType,
        questions: dto.questions as unknown as Prisma.InputJsonValue | undefined,
        anonymous: dto.anonymous,
        requireAllQuestions: dto.requireAllQuestions,
        showProgress: dto.showProgress,
        thankYouMessage: dto.thankYouMessage,
        redirectUrl: dto.redirectUrl,
        triggerEvent: dto.triggerEvent,
        targetSegment: dto.targetSegment as unknown as Prisma.InputJsonValue | undefined,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  private validateRequiredQuestions(survey: any, answers: Record<string, unknown>) {
    const questions: SurveyQuestion[] = Array.isArray(survey.questions) ? survey.questions : [];
    const required = questions.filter((q) => q.required || survey.requireAllQuestions).map((q) => q.id);

    const missing = required.filter((id) => answers[id] === undefined || answers[id] === null || answers[id] === '');
    if (missing.length > 0) {
      throw new BadRequestException('Missing required answers');
    }

    if (survey.requireAllQuestions) {
      const missingAny = questions.filter((q) => answers[q.id] === undefined).map((q) => q.id);
      if (missingAny.length > 0) {
        throw new BadRequestException('All questions must be answered');
      }
    }
  }

  async submitResponse(tenantId: string, surveyId: string, userId: string | null, dto: SubmitSurveyResponseDto) {
    const survey = await this.findOne(tenantId, surveyId);
    this.validateRequiredQuestions(survey, dto.answers ?? {});

    const response = await this.prisma.surveyResponse.create({
      data: {
        tenantId,
        surveyId,
        userId: survey.anonymous ? null : userId ?? undefined,
        respondentEmail: dto.respondentEmail,
        answers: dto.answers as Prisma.InputJsonValue,
        completionPercentage: dto.completionPercentage ?? 100,
        timeToCompleteSeconds: dto.timeToCompleteSeconds,
        responseChannel: dto.responseChannel,
        userAgent: dto.userAgent,
      },
    });

    await this.prisma.survey.update({
      where: { id: surveyId },
      data: { responseCount: { increment: 1 } },
    });

    this.events.emit('survey.response.submitted', { surveyId, responseId: response.id });
    return response;
  }

  @OnEvent('order.completed')
  async handleOrderCompleted(payload: { tenantId: string }) {
    await this.triggerEventSurvey(payload.tenantId, 'order.completed');
  }

  @OnEvent('user.onboarded')
  async handleUserOnboarded(payload: { tenantId: string }) {
    await this.triggerEventSurvey(payload.tenantId, 'user.onboarded');
  }

  private async triggerEventSurvey(tenantId: string, event: string) {
    await this.prisma.survey.updateMany({
      where: { tenantId, triggerEvent: event, status: 'ACTIVE' },
      data: { sentCount: { increment: 1 } },
    });
  }
}
