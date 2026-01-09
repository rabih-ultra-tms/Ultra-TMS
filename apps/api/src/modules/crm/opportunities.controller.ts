import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('opportunities')
@UseGuards(JwtAuthGuard)
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('stage') stage?: string,
    @Query('ownerId') ownerId?: string,
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
  ) {
    return this.opportunitiesService.findAll(tenantId, { page, limit, stage, ownerId, companyId, search });
  }

  @Get('pipeline')
  async getPipeline(
    @CurrentTenant() tenantId: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.opportunitiesService.getPipeline(tenantId, ownerId);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.opportunitiesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.delete(tenantId, id, userId);
  }

  @Patch(':id/stage')
  async updateStage(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { stage: string; reason?: string },
  ) {
    return this.opportunitiesService.updateStage(tenantId, id, userId, dto.stage, dto.reason);
  }

  @Post(':id/convert')
  async convertToCustomer(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.opportunitiesService.convertToCustomer(tenantId, id, userId);
  }

  @Get(':id/activities')
  async getActivities(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.opportunitiesService.getActivities(tenantId, id, { page, limit });
  }

  @Patch(':id/owner')
  async updateOwner(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { ownerId: string },
  ) {
    return this.opportunitiesService.updateOwner(tenantId, id, userId, dto.ownerId);
  }
}
