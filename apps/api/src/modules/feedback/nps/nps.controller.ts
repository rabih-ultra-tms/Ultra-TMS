import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { NpsSurveysService } from './nps-surveys.service';
import { FeedbackAnalyticsService } from '../analytics/feedback-analytics.service';
import { CreateNpsSurveyDto, SubmitNpsResponseDto, UpdateNpsSurveyDto } from '../dto/feedback.dto';

@Controller('feedback/nps')
@UseGuards(JwtAuthGuard)
export class NpsController {
  constructor(
    private readonly surveys: NpsSurveysService,
    private readonly analytics: FeedbackAnalyticsService,
  ) {}

  @Get('surveys')
  list(@CurrentTenant() tenantId: string) {
    return this.surveys.list(tenantId);
  }

  @Post('surveys')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateNpsSurveyDto,
  ) {
    return this.surveys.create(tenantId, userId, dto);
  }

  @Get('surveys/:id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.surveys.findOne(tenantId, id);
  }

  @Put('surveys/:id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNpsSurveyDto,
  ) {
    return this.surveys.update(tenantId, id, dto);
  }

  @Post('surveys/:id/activate')
  activate(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.surveys.activate(tenantId, id);
  }

  @Post('respond')
  respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SubmitNpsResponseDto,
  ) {
    return this.surveys.submitResponse(tenantId, userId, { ...dto, respondentEmail: dto.respondentEmail ?? email });
  }

  @Get('responses')
  responses(@CurrentTenant() tenantId: string, @Query('surveyId') surveyId?: string) {
    return this.analytics.listNpsResponses(tenantId, surveyId);
  }

  @Get('score')
  score(@CurrentTenant() tenantId: string, @Query('surveyId') surveyId?: string) {
    return this.analytics.getNpsScore(tenantId, surveyId);
  }
}
