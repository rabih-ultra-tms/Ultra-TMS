import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { BatchRateLookupDto } from './dto/batch-rate-lookup.dto';
import { RateLookupDto } from './dto/rate-lookup.dto';
import { RateLookupService } from './rate-lookup.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Market Rates')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class RateLookupController {
  constructor(private readonly service: RateLookupService) {}

  @Post('api/v1/rates/lookup')
  @ApiOperation({ summary: 'Lookup current market rate' })
  @ApiStandardResponse('Rate lookup result')
  @ApiErrorResponses()
  lookup(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RateLookupDto,
  ) {
    return this.service.lookup(tenantId, userId, dto);
  }

  @Post('api/v1/rates/lookup/batch')
  @ApiOperation({ summary: 'Batch rate lookup' })
  @ApiStandardResponse('Batch rate lookup result')
  @ApiErrorResponses()
  batchLookup(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: BatchRateLookupDto,
  ) {
    return this.service.batchLookup(tenantId, userId, dto);
  }
}
