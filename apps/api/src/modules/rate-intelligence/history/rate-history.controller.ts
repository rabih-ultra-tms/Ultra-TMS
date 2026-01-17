import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { RateHistoryQueryDto } from './dto/rate-history-query.dto';
import { RateHistoryService } from './rate-history.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Rate History')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class RateHistoryController {
  constructor(private readonly service: RateHistoryService) {}

  @Get('api/v1/rates/history')
  @ApiOperation({ summary: 'Get rate history' })
  @ApiQuery({ name: 'origin', required: false, type: String })
  @ApiQuery({ name: 'destination', required: false, type: String })
  @ApiStandardResponse('Rate history')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  history(@CurrentTenant() tenantId: string, @Query() query: RateHistoryQueryDto) {
    return this.service.history(tenantId, query);
  }

  @Get('api/v1/rates/trends')
  @ApiOperation({ summary: 'Get rate trends' })
  @ApiQuery({ name: 'origin', required: false, type: String })
  @ApiQuery({ name: 'destination', required: false, type: String })
  @ApiStandardResponse('Rate trends')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  trends(@CurrentTenant() tenantId: string, @Query() query: RateHistoryQueryDto) {
    return this.service.trends(tenantId, query);
  }
}
