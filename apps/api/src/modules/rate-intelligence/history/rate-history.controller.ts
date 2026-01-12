import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { RateHistoryQueryDto } from './dto/rate-history-query.dto';
import { RateHistoryService } from './rate-history.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RateHistoryController {
  constructor(private readonly service: RateHistoryService) {}

  @Get('api/v1/rates/history')
  history(@CurrentTenant() tenantId: string, @Query() query: RateHistoryQueryDto) {
    return this.service.history(tenantId, query);
  }

  @Get('api/v1/rates/trends')
  trends(@CurrentTenant() tenantId: string, @Query() query: RateHistoryQueryDto) {
    return this.service.trends(tenantId, query);
  }
}
