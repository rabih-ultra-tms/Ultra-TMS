import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, SubmitSurveyResponseDto, UpdateSurveyDto } from '../dto/feedback.dto';

@Controller('api/v1/feedback/surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveys: SurveysService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.surveys.list(tenantId);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSurveyDto,
  ) {
    return this.surveys.create(tenantId, userId, dto);
  }

  @Get(':id')
  getOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.surveys.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSurveyDto,
  ) {
    return this.surveys.update(tenantId, id, dto);
  }

  @Post(':id/respond')
  respond(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitSurveyResponseDto,
    @Param('id') id: string,
  ) {
    return this.surveys.submitResponse(tenantId, id, userId, dto);
  }
}
