import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { EdiQueueService } from './edi-queue.service';

@Controller('edi/queue')
@UseGuards(JwtAuthGuard)
export class EdiQueueController {
  constructor(private readonly service: EdiQueueService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get('stats')
  stats(@CurrentTenant() tenantId: string) {
    return this.service.stats(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post(':id/retry')
  retry(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.retry(tenantId, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.cancel(tenantId, id);
  }

  @Post('process')
  process(@CurrentTenant() tenantId: string) {
    return this.service.process(tenantId);
  }
}
