import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CapacityService } from './capacity.service';
import { CapacitySearchDto, ContactResultDto, SearchQueryDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Load Board')
@ApiBearerAuth('JWT-auth')
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Post('api/v1/load-board/capacity/search')
  @ApiOperation({ summary: 'Search capacity' })
  @ApiStandardResponse('Capacity search results')
  @ApiErrorResponses()
  search(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CapacitySearchDto,
  ) {
    return this.capacityService.search(tenantId, userId, dto);
  }

  @Get('api/v1/load-board/capacity/searches')
  @ApiOperation({ summary: 'List capacity searches' })
  @ApiStandardResponse('Capacity searches list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @Query() query: SearchQueryDto) {
    return this.capacityService.list(tenantId, query);
  }

  @Get('api/v1/load-board/capacity/searches/:id')
  @ApiOperation({ summary: 'Get capacity search by ID' })
  @ApiParam({ name: 'id', description: 'Search ID' })
  @ApiStandardResponse('Capacity search details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.capacityService.findOne(tenantId, id);
  }

  @Post('api/v1/load-board/capacity/results/:id/contact')
  @ApiOperation({ summary: 'Contact capacity result' })
  @ApiParam({ name: 'id', description: 'Result ID' })
  @ApiStandardResponse('Capacity contact requested')
  @ApiErrorResponses()
  contact(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ContactResultDto,
  ) {
    return this.capacityService.contactResult(tenantId, id, dto);
  }
}
