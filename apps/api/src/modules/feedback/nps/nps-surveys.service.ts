import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../prisma.service';
import { NpsScoreService } from './nps-score.service';
import { CreateNpsSurveyDto, SubmitNpsResponseDto, UpdateNpsSurveyDto } from '../dto/feedback.dto';

@Injectable()
export class NpsSurveysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly npsScore: NpsScoreService,
    private readonly events: EventEmitter2,
  ) {}

  async list(tenantId: string) {
    return this.prisma.nPSSurvey.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const survey = await this.prisma.nPSSurvey.findFirst({ where: { id, tenantId } });
    if (!survey) throw new NotFoundException('NPS survey not found');
    return survey;
  }

  async create(tenantId: string, userId: string, dto: CreateNpsSurveyDto) {
    return this.prisma.nPSSurvey.create({
      data: {
        tenantId,
        surveyNumber: dto.surveyNumber,
        question: dto.question,
        followUpQuestion: dto.followUpQuestion,
        targetType: dto.targetType,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: 'DRAFT',
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateNpsSurveyDto) {
    await this.findOne(tenantId, id);
    return this.prisma.nPSSurvey.update({
      where: { id },
      data: {
        surveyNumber: dto.surveyNumber,
        question: dto.question,
        followUpQuestion: dto.followUpQuestion,
        targetType: dto.targetType,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: dto.status,
      },
    });
  }

  async activate(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.nPSSurvey.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        scheduledAt: new Date(),
      },
    });
  }

  async submitResponse(tenantId: string, userId: string | null, dto: SubmitNpsResponseDto) {
    const survey = await this.findOne(tenantId, dto.surveyId);
    if (survey.status === 'DRAFT') {
      throw new BadRequestException('Survey is not active');
    }

    const category = this.npsScore.categorizeScore(dto.score);
    const response = await this.prisma.nPSResponse.create({
      data: {
        tenantId,
        surveyId: dto.surveyId,
        respondentId: dto.respondentId ?? userId ?? undefined,
        respondentEmail: dto.respondentEmail,
        respondentType: dto.respondentType,
        score: dto.score,
        category,
        feedback: dto.feedback,
        followUpResponse: dto.followUpResponse,
      },
    });

    this.events.emit('nps.response.submitted', {
      surveyId: dto.surveyId,
      score: dto.score,
      category,
    });

    return response;
  }
}
