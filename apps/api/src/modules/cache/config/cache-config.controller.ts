import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CacheConfigService } from './cache-config.service';
import { UpdateCacheConfigDto, CreateInvalidationRuleDto } from '../dto/cache.dto';
import { InvalidationService } from '../invalidation/invalidation.service';

@Controller('cache')
@UseGuards(JwtAuthGuard)
export class CacheConfigController {
  constructor(
    private readonly cacheConfigService: CacheConfigService,
    private readonly invalidationService: InvalidationService,
  ) {}

  @Get('config')
  listConfigs(@CurrentTenant() tenantId: string) {
    return this.cacheConfigService.listConfigs(tenantId);
  }

  @Put('config/:key')
  updateConfig(
    @CurrentTenant() tenantId: string,
    @Param('key') key: string,
    @Body() dto: UpdateCacheConfigDto,
  ) {
    return this.cacheConfigService.updateConfig(tenantId, key, dto);
  }

  @Get('invalidation-rules')
  listRules(@CurrentTenant() tenantId: string) {
    return this.invalidationService.rules(tenantId);
  }

  @Post('invalidation-rules')
  createRule(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvalidationRuleDto,
  ) {
    return this.invalidationService.createRule(tenantId, userId, dto);
  }

  @Delete('invalidation-rules/:id')
  deleteRule(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.invalidationService.deleteRule(tenantId, id);
  }
}
