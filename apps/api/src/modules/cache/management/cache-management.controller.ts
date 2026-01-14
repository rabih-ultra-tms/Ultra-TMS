import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { CacheManagementService } from './cache-management.service';
import { InvalidateCacheDto } from '../dto/cache.dto';

@Controller('cache')
@UseGuards(JwtAuthGuard)
export class CacheManagementController {
  constructor(private readonly cacheService: CacheManagementService) {}

  @Get('health')
  health() {
    return this.cacheService.health();
  }

  @Get('stats')
  stats(@CurrentTenant() tenantId: string) {
    return this.cacheService.statsForTenant(tenantId);
  }

  @Get('keys')
  keys(@Query('pattern') pattern?: string) {
    return this.cacheService.listKeys(pattern ?? '*');
  }

  @Delete('keys/:pattern')
  deletePattern(@Param('pattern') pattern: string) {
    return this.cacheService.deleteByPattern(pattern);
  }

  @Post('invalidate')
  invalidate(@CurrentTenant() tenantId: string, @Body() dto: InvalidateCacheDto) {
    return this.cacheService.invalidate(tenantId, dto);
  }

  @Post('warm')
  warm(@CurrentTenant() tenantId: string, @Query('key') key?: string) {
    return this.cacheService.warm(tenantId, key);
  }
}
