import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { RateLimitService } from './rate-limit.service';
import { UpdateRateLimitDto } from '../dto/cache.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('cache/rate-limits')
@UseGuards(JwtAuthGuard)
@ApiTags('Cache')
@ApiBearerAuth('JWT-auth')
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get()
  @ApiOperation({ summary: 'List rate limits' })
  @ApiStandardResponse('Rate limits list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.rateLimitService.list(tenantId);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get rate limit by key' })
  @ApiParam({ name: 'key', description: 'Rate limit key' })
  @ApiStandardResponse('Rate limit details')
  @ApiErrorResponses()
  get(@Param('key') key: string) {
    return this.rateLimitService.getByKey(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update rate limit' })
  @ApiParam({ name: 'key', description: 'Rate limit key' })
  @ApiStandardResponse('Rate limit updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('key') key: string, @Body() dto: UpdateRateLimitDto) {
    return this.rateLimitService.update(key, dto, tenantId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get rate limit usage' })
  @ApiQuery({ name: 'key', required: true, type: String })
  @ApiStandardResponse('Rate limit usage')
  @ApiErrorResponses()
  usage(@Query('key') key: string) {
    return this.rateLimitService.usage(key);
  }

  @Post(':key/reset')
  @ApiOperation({ summary: 'Reset rate limit' })
  @ApiParam({ name: 'key', description: 'Rate limit key' })
  @ApiStandardResponse('Rate limit reset')
  @ApiErrorResponses()
  reset(@Param('key') key: string) {
    return this.rateLimitService.reset(key);
  }
}
