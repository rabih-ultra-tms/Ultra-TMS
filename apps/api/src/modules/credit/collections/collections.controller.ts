import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CollectionsService } from './collections.service';
import { PaginationDto } from '../dto/pagination.dto';
import { CreateCollectionActivityDto, UpdateCollectionActivityDto } from '../dto/collection-activity.dto';

@Controller('credit/collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async queue(
    @CurrentTenant() tenantId: string,
    @Query() query: PaginationDto,
  ) {
    return this.collectionsService.queue(tenantId, query);
  }

  @Get('customer/:companyId')
  async historyByCustomer(
    @CurrentTenant() tenantId: string,
    @Param('companyId') companyId: string,
  ) {
    return this.collectionsService.historyByCustomer(tenantId, companyId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCollectionActivityDto,
  ) {
    return this.collectionsService.create(tenantId, user.id, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCollectionActivityDto,
  ) {
    return this.collectionsService.update(tenantId, user.id, id, dto);
  }

  @Get('aging')
  async aging(
    @CurrentTenant() tenantId: string,
  ) {
    return this.collectionsService.agingReport(tenantId);
  }

  @Get('follow-ups')
  async followUps(
    @CurrentTenant() tenantId: string,
  ) {
    return this.collectionsService.followUpsDue(tenantId);
  }
}
