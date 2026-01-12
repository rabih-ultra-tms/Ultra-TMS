import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { BatchRateLookupDto } from './dto/batch-rate-lookup.dto';
import { RateLookupDto } from './dto/rate-lookup.dto';
import { RateLookupService } from './rate-lookup.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class RateLookupController {
  constructor(private readonly service: RateLookupService) {}

  @Post('api/v1/rates/lookup')
  lookup(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RateLookupDto,
  ) {
    return this.service.lookup(tenantId, userId, dto);
  }

  @Post('api/v1/rates/lookup/batch')
  batchLookup(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BatchRateLookupDto,
  ) {
    return this.service.batchLookup(tenantId, userId, dto);
  }
}
