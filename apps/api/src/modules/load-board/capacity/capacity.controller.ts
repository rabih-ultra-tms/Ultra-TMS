import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CapacityService } from './capacity.service';
import { CapacitySearchDto, ContactResultDto, SearchQueryDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Post('api/v1/load-board/capacity/search')
  search(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CapacitySearchDto,
  ) {
    return this.capacityService.search(tenantId, userId, dto);
  }

  @Get('api/v1/load-board/capacity/searches')
  list(@CurrentTenant() tenantId: string, @Query() query: SearchQueryDto) {
    return this.capacityService.list(tenantId, query);
  }

  @Get('api/v1/load-board/capacity/searches/:id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.capacityService.findOne(tenantId, id);
  }

  @Post('api/v1/load-board/capacity/results/:id/contact')
  contact(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ContactResultDto,
  ) {
    return this.capacityService.contactResult(tenantId, id, dto);
  }
}
