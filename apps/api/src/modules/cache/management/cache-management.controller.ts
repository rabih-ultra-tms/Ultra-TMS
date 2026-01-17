import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { CacheManagementService } from './cache-management.service';
import { InvalidateCacheDto } from '../dto/cache.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('cache')
@UseGuards(JwtAuthGuard)
@ApiTags('Cache')
@ApiBearerAuth('JWT-auth')
export class CacheManagementController {
  constructor(private readonly cacheService: CacheManagementService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get cache health' })
  @ApiStandardResponse('Cache health')
  @ApiErrorResponses()
  health() {
    return this.cacheService.health();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get cache stats' })
  @ApiStandardResponse('Cache stats')
  @ApiErrorResponses()
  stats(@CurrentTenant() tenantId: string) {
    return this.cacheService.statsForTenant(tenantId);
  }

  @Get('keys')
  @ApiOperation({ summary: 'List cache keys' })
  @ApiQuery({ name: 'pattern', required: false, type: String })
  @ApiStandardResponse('Cache keys list')
  @ApiErrorResponses()
  keys(@Query('pattern') pattern?: string) {
    return this.cacheService.listKeys(pattern ?? '*');
  }

  @Delete('keys/:pattern')
  @ApiOperation({ summary: 'Delete cache keys by pattern' })
  @ApiParam({ name: 'pattern', description: 'Cache key pattern' })
  @ApiStandardResponse('Cache keys deleted')
  @ApiErrorResponses()
  deletePattern(@Param('pattern') pattern: string) {
    return this.cacheService.deleteByPattern(pattern);
  }

  @Post('invalidate')
  @ApiOperation({ summary: 'Invalidate cache entries' })
  @ApiStandardResponse('Cache invalidated')
  @ApiErrorResponses()
  invalidate(@CurrentTenant() tenantId: string, @Body() dto: InvalidateCacheDto) {
    return this.cacheService.invalidate(tenantId, dto);
  }

  @Post('warm')
  @ApiOperation({ summary: 'Warm cache' })
  @ApiQuery({ name: 'key', required: false, type: String })
  @ApiStandardResponse('Cache warm triggered')
  @ApiErrorResponses()
  warm(@CurrentTenant() tenantId: string, @Query('key') key?: string) {
    return this.cacheService.warm(tenantId, key);
  }
}
