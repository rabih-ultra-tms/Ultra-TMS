import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CollectionsService } from './collections.service';
import { PaginationDto } from '../dto/pagination.dto';
import { CreateCollectionActivityDto, UpdateCollectionActivityDto } from '../dto/collection-activity.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('credit/collections')
@UseGuards(JwtAuthGuard)
@ApiTags('Credit Applications')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get collections queue' })
  @ApiStandardResponse('Collections queue')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async queue(
    @CurrentTenant() tenantId: string,
    @Query() query: PaginationDto,
  ) {
    return this.collectionsService.queue(tenantId, query);
  }

  @Get('customer/:companyId')
  @ApiOperation({ summary: 'Get collections history by customer' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiStandardResponse('Customer collections history')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async historyByCustomer(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.collectionsService.historyByCustomer(tenantId, companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create collection activity' })
  @ApiStandardResponse('Collection activity created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCollectionActivityDto,
  ) {
    return this.collectionsService.create(tenantId, user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update collection activity' })
  @ApiParam({ name: 'id', description: 'Collection activity ID' })
  @ApiStandardResponse('Collection activity updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCollectionActivityDto,
  ) {
    return this.collectionsService.update(tenantId, user.id, id, dto);
  }

  @Get('aging')
  @ApiOperation({ summary: 'Get aging report' })
  @ApiStandardResponse('Aging report')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async aging(
    @CurrentTenant() tenantId: string,
  ) {
    return this.collectionsService.agingReport(tenantId);
  }

  @Get('follow-ups')
  @ApiOperation({ summary: 'Get follow-ups due' })
  @ApiStandardResponse('Follow-ups due')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  async followUps(
    @CurrentTenant() tenantId: string,
  ) {
    return this.collectionsService.followUpsDue(tenantId);
  }
}
