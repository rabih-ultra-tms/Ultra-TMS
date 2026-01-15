import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { GlobalSearchService } from './global-search.service';
import { GlobalSearchDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Global Search')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Global search across entities' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiStandardResponse('Global search results')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')
  async search(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Query() query: GlobalSearchDto,
  ) {
    return this.globalSearchService.search(tenantId, userId, query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiStandardResponse('Search suggestions')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')
  async suggestions(
    @CurrentTenant() tenantId: string,
    @Query('q') q: string,
  ) {
    return this.globalSearchService.suggestions(tenantId, q ?? '');
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent searches' })
  @ApiStandardResponse('Recent searches')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP', 'ACCOUNTING', 'CARRIER_MANAGER', 'AGENT')
  async recent(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.globalSearchService.recent(tenantId, userId);
  }
}
