import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CacheConfigService } from './cache-config.service';
import { UpdateCacheConfigDto, CreateInvalidationRuleDto } from '../dto/cache.dto';
import { InvalidationService } from '../invalidation/invalidation.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('cache')
@UseGuards(JwtAuthGuard)
@ApiTags('Cache')
@ApiBearerAuth('JWT-auth')
export class CacheConfigController {
  constructor(
    private readonly cacheConfigService: CacheConfigService,
    private readonly invalidationService: InvalidationService,
  ) {}

  @Get('config')
  @ApiOperation({ summary: 'List cache configs' })
  @ApiStandardResponse('Cache configs list')
  @ApiErrorResponses()
  listConfigs(@CurrentTenant() tenantId: string) {
    return this.cacheConfigService.listConfigs(tenantId);
  }

  @Put('config/:key')
  @ApiOperation({ summary: 'Update cache config' })
  @ApiParam({ name: 'key', description: 'Config key' })
  @ApiStandardResponse('Cache config updated')
  @ApiErrorResponses()
  updateConfig(
    @CurrentTenant() tenantId: string,
    @Param('key') key: string,
    @Body() dto: UpdateCacheConfigDto,
  ) {
    return this.cacheConfigService.updateConfig(tenantId, key, dto);
  }

  @Get('invalidation-rules')
  @ApiOperation({ summary: 'List cache invalidation rules' })
  @ApiStandardResponse('Invalidation rules list')
  @ApiErrorResponses()
  listRules(@CurrentTenant() tenantId: string) {
    return this.invalidationService.rules(tenantId);
  }

  @Post('invalidation-rules')
  @ApiOperation({ summary: 'Create cache invalidation rule' })
  @ApiStandardResponse('Invalidation rule created')
  @ApiErrorResponses()
  createRule(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvalidationRuleDto,
  ) {
    return this.invalidationService.createRule(tenantId, userId, dto);
  }

  @Delete('invalidation-rules/:id')
  @ApiOperation({ summary: 'Delete cache invalidation rule' })
  @ApiParam({ name: 'id', description: 'Rule ID' })
  @ApiStandardResponse('Invalidation rule deleted')
  @ApiErrorResponses()
  deleteRule(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.invalidationService.deleteRule(tenantId, id);
  }
}
