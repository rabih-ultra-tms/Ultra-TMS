import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { AnalyticsService } from './analytics.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('load-board/analytics')
@UseGuards(JwtAuthGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get load board post metrics' })
  @ApiStandardResponse('Post metrics')
  @ApiErrorResponses()
  postMetrics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.postMetrics(tenantId);
  }

  @Get('leads')
  @ApiOperation({ summary: 'Get load board lead metrics' })
  @ApiStandardResponse('Lead metrics')
  @ApiErrorResponses()
  leadMetrics(@CurrentTenant() tenantId: string) {
    return this.analyticsService.leadMetrics(tenantId);
  }

  @Get('boards')
  @ApiOperation({ summary: 'Compare load boards' })
  @ApiStandardResponse('Load board comparison')
  @ApiErrorResponses()
  boardComparison(@CurrentTenant() tenantId: string) {
    return this.analyticsService.boardComparison(tenantId);
  }
}
