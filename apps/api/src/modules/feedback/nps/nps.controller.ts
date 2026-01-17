import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { NpsSurveysService } from './nps-surveys.service';
import { FeedbackAnalyticsService } from '../analytics/feedback-analytics.service';
import { CreateNpsSurveyDto, SubmitNpsResponseDto, UpdateNpsSurveyDto } from '../dto/feedback.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('feedback/nps')
@UseGuards(JwtAuthGuard)
@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
export class NpsController {
  constructor(
    private readonly surveys: NpsSurveysService,
    private readonly analytics: FeedbackAnalyticsService,
  ) {}

  @Get('surveys')
  @ApiOperation({ summary: 'List NPS surveys' })
  @ApiStandardResponse('NPS surveys list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.surveys.list(tenantId);
  }

  @Post('surveys')
  @ApiOperation({ summary: 'Create NPS survey' })
  @ApiStandardResponse('NPS survey created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateNpsSurveyDto,
  ) {
    return this.surveys.create(tenantId, userId, dto);
  }

  @Get('surveys/:id')
  @ApiOperation({ summary: 'Get NPS survey by ID' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiStandardResponse('NPS survey details')
  @ApiErrorResponses()
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.surveys.findOne(tenantId, id);
  }

  @Put('surveys/:id')
  @ApiOperation({ summary: 'Update NPS survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiStandardResponse('NPS survey updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNpsSurveyDto,
  ) {
    return this.surveys.update(tenantId, id, dto);
  }

  @Post('surveys/:id/activate')
  @ApiOperation({ summary: 'Activate NPS survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiStandardResponse('NPS survey activated')
  @ApiErrorResponses()
  activate(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.surveys.activate(tenantId, id);
  }

  @Post('respond')
  @ApiOperation({ summary: 'Submit NPS response' })
  @ApiStandardResponse('NPS response submitted')
  @ApiErrorResponses()
  respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
    @Body() dto: SubmitNpsResponseDto,
  ) {
    return this.surveys.submitResponse(tenantId, userId, { ...dto, respondentEmail: dto.respondentEmail ?? email });
  }

  @Get('responses')
  @ApiOperation({ summary: 'List NPS responses' })
  @ApiQuery({ name: 'surveyId', required: false, type: String })
  @ApiStandardResponse('NPS responses list')
  @ApiErrorResponses()
  responses(@CurrentTenant() tenantId: string, @Query('surveyId') surveyId?: string) {
    return this.analytics.listNpsResponses(tenantId, surveyId);
  }

  @Get('score')
  @ApiOperation({ summary: 'Get NPS score' })
  @ApiQuery({ name: 'surveyId', required: false, type: String })
  @ApiStandardResponse('NPS score')
  @ApiErrorResponses()
  score(@CurrentTenant() tenantId: string, @Query('surveyId') surveyId?: string) {
    return this.analytics.getNpsScore(tenantId, surveyId);
  }
}
