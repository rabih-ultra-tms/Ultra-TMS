import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateJobDto } from '../dto/job.dto';
import { TemplatesService } from './templates.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('jobs/templates')
@UseGuards(JwtAuthGuard)
@ApiTags('Scheduler')
@ApiBearerAuth('JWT-auth')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List job templates' })
  @ApiStandardResponse('Job templates list')
  @ApiErrorResponses()
  list() {
    return this.service.list();
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get job template by code' })
  @ApiParam({ name: 'code', description: 'Template code' })
  @ApiStandardResponse('Job template details')
  @ApiErrorResponses()
  get(@Param('code') code: string) {
    return this.service.get(code);
  }

  @Post(':code/create')
  @ApiOperation({ summary: 'Create job from template' })
  @ApiParam({ name: 'code', description: 'Template code' })
  @ApiStandardResponse('Job created from template')
  @ApiErrorResponses()
  createFromTemplate(
    @Param('code') code: string,
    @Body() overrides: Partial<CreateJobDto>,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createFromTemplate(code, overrides, tenantId, userId);
  }
}
