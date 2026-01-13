import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { GlobalSearchService } from './global-search.service';
import { GlobalSearchDto } from '../dto';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  async search(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Query() query: GlobalSearchDto,
  ) {
    return this.globalSearchService.search(tenantId, userId, query);
  }

  @Get('suggestions')
  async suggestions(
    @CurrentTenant() tenantId: string,
    @Query('q') q: string,
  ) {
    return this.globalSearchService.suggestions(tenantId, q ?? '');
  }

  @Get('recent')
  async recent(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.globalSearchService.recent(tenantId, userId);
  }
}
