import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { EdiQueueService } from './edi-queue.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('edi/queue')
@UseGuards(JwtAuthGuard)
@ApiTags('EDI Transactions')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class EdiQueueController {
  constructor(private readonly service: EdiQueueService) {}

  @Get()
  @ApiOperation({ summary: 'List EDI queue items' })
  @ApiStandardResponse('EDI queue list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get EDI queue statistics' })
  @ApiStandardResponse('EDI queue stats')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  stats(@CurrentTenant() tenantId: string) {
    return this.service.stats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EDI queue item by ID' })
  @ApiParam({ name: 'id', description: 'Queue item ID' })
  @ApiStandardResponse('EDI queue item details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry EDI queue item' })
  @ApiParam({ name: 'id', description: 'Queue item ID' })
  @ApiStandardResponse('EDI queue item retried')
  @ApiErrorResponses()
  retry(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.retry(tenantId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel EDI queue item' })
  @ApiParam({ name: 'id', description: 'Queue item ID' })
  @ApiStandardResponse('EDI queue item canceled')
  @ApiErrorResponses()
  cancel(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.cancel(tenantId, id);
  }

  @Post('process')
  @ApiOperation({ summary: 'Process EDI queue' })
  @ApiStandardResponse('EDI queue processing started')
  @ApiErrorResponses()
  @Roles('admin')
  process(@CurrentTenant() tenantId: string) {
    return this.service.process(tenantId);
  }
}
