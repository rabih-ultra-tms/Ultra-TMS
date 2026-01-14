import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateJobDto, UpdateJobDto } from '../dto/job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly service: JobsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.get(id, tenantId);
  }

  @Post()
  create(@Body() dto: CreateJobDto, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.create(dto, tenantId, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateJobDto, @CurrentTenant() tenantId: string) {
    return this.service.update(id, dto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.remove(id, tenantId);
  }

  @Post(':id/run')
  run(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentTenant() tenantId: string) {
    return this.service.runNow(id, tenantId, userId);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.pause(id, tenantId);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.resume(id, tenantId);
  }
}
