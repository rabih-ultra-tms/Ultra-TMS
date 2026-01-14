import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { ExecutionsService } from './executions.service';

@Controller('jobs/:jobId/executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
  constructor(private readonly service: ExecutionsService) {}

  @Get()
  list(@Param('jobId') jobId: string, @CurrentTenant() tenantId: string) {
    return this.service.list(jobId, tenantId);
  }

  @Get(':executionId')
  get(@Param('jobId') jobId: string, @Param('executionId') executionId: string, @CurrentTenant() tenantId: string) {
    return this.service.get(jobId, executionId, tenantId);
  }

  @Post(':executionId/cancel')
  cancel(@Param('jobId') jobId: string, @Param('executionId') executionId: string, @CurrentTenant() tenantId: string) {
    return this.service.cancel(jobId, executionId, tenantId);
  }

  @Post(':executionId/retry')
  retry(@Param('jobId') jobId: string, @Param('executionId') executionId: string, @CurrentTenant() tenantId: string) {
    return this.service.retry(jobId, executionId, tenantId);
  }
}
