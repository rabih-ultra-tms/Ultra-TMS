import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { ExecutionsService } from './executions.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('jobs/:jobId/executions')
@UseGuards(JwtAuthGuard)
@ApiTags('Scheduler')
@ApiBearerAuth('JWT-auth')
export class ExecutionsController {
  constructor(private readonly service: ExecutionsService) {}

  @Get()
  @ApiOperation({ summary: 'List job executions' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiStandardResponse('Job executions list')
  @ApiErrorResponses()
  list(@Param('jobId') jobId: string, @CurrentTenant() tenantId: string) {
    return this.service.list(jobId, tenantId);
  }

  @Get(':executionId')
  @ApiOperation({ summary: 'Get job execution by ID' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiParam({ name: 'executionId', description: 'Execution ID' })
  @ApiStandardResponse('Job execution details')
  @ApiErrorResponses()
  get(@Param('jobId') jobId: string, @Param('executionId') executionId: string, @CurrentTenant() tenantId: string) {
    return this.service.get(jobId, executionId, tenantId);
  }

  @Post(':executionId/cancel')
  @ApiOperation({ summary: 'Cancel job execution' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiParam({ name: 'executionId', description: 'Execution ID' })
  @ApiStandardResponse('Job execution cancelled')
  @ApiErrorResponses()
  cancel(@Param('jobId') jobId: string, @Param('executionId') executionId: string, @CurrentTenant() tenantId: string) {
    return this.service.cancel(jobId, executionId, tenantId);
  }

  @Post(':executionId/retry')
  @ApiOperation({ summary: 'Retry job execution' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiParam({ name: 'executionId', description: 'Execution ID' })
  @ApiStandardResponse('Job execution retried')
  @ApiErrorResponses()
  retry(@Param('jobId') jobId: string, @Param('executionId') executionId: string, @CurrentTenant() tenantId: string) {
    return this.service.retry(jobId, executionId, tenantId);
  }
}
