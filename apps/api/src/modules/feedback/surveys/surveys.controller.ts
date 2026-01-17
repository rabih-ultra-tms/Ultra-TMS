import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, SubmitSurveyResponseDto, UpdateSurveyDto } from '../dto/feedback.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('feedback/surveys')
@UseGuards(JwtAuthGuard)
@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @Get()
  @ApiOperation({ summary: 'List surveys' })
  @ApiStandardResponse('Surveys list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.surveys.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create survey' })
  @ApiStandardResponse('Survey created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSurveyDto,
  ) {
    return this.surveys.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey by ID' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiStandardResponse('Survey details')
  @ApiErrorResponses()
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.surveys.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update survey' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiStandardResponse('Survey updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSurveyDto,
  ) {
    return this.surveys.update(tenantId, id, dto);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Submit survey response' })
  @ApiParam({ name: 'id', description: 'Survey ID' })
  @ApiStandardResponse('Survey response submitted')
  @ApiErrorResponses()
  respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitSurveyResponseDto,
    @Param('id') id: string,
  ) {
    return this.surveys.submitResponse(tenantId, id, userId, dto);
  }
}
