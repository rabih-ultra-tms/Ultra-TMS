import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateJobDto, UpdateJobDto } from '../dto/job.dto';
import { JobsService } from './jobs.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiTags('Scheduler')
@ApiBearerAuth('JWT-auth')
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List jobs' })
  @ApiStandardResponse('Jobs list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiStandardResponse('Job details')
  @ApiErrorResponses()
  get(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.get(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create job' })
  @ApiStandardResponse('Job created')
  @ApiErrorResponses()
  create(@Body() dto: CreateJobDto, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.create(dto, tenantId, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiStandardResponse('Job updated')
  @ApiErrorResponses()
  update(@Param('id') id: string, @Body() dto: UpdateJobDto, @CurrentTenant() tenantId: string) {
    return this.service.update(id, dto, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiStandardResponse('Job deleted')
  @ApiErrorResponses()
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.remove(id, tenantId);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run job now' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiStandardResponse('Job execution started')
  @ApiErrorResponses()
  run(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentTenant() tenantId: string) {
    return this.service.runNow(id, tenantId, userId);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiStandardResponse('Job paused')
  @ApiErrorResponses()
  pause(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.pause(id, tenantId);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiStandardResponse('Job resumed')
  @ApiErrorResponses()
  resume(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.resume(id, tenantId);
  }
}
