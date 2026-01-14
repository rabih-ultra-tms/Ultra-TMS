import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { RateLimitService } from './rate-limit.service';
import { UpdateRateLimitDto } from '../dto/cache.dto';

@Controller('cache/rate-limits')
@UseGuards(JwtAuthGuard)
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.rateLimitService.list(tenantId);
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.rateLimitService.getByKey(key);
  }

  @Put(':key')
  update(@CurrentTenant() tenantId: string, @Param('key') key: string, @Body() dto: UpdateRateLimitDto) {
    return this.rateLimitService.update(key, dto, tenantId);
  }

  @Get('usage')
  usage(@Query('key') key: string) {
    return this.rateLimitService.usage(key);
  }

  @Post(':key/reset')
  reset(@Param('key') key: string) {
    return this.rateLimitService.reset(key);
  }
}
