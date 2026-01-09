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
import { CompaniesService } from './companies.service';
import { ContactsService } from './contacts.service';
import { OpportunitiesService } from './opportunities.service';
import { ActivitiesService } from './activities.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly contactsService: ContactsService,
    private readonly opportunitiesService: OpportunitiesService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('companyType') companyType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('assignedUserId') assignedUserId?: string,
  ) {
    return this.companiesService.findAll(tenantId, { page, limit, companyType, status, search, assignedUserId });
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.companiesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.companiesService.delete(tenantId, id, userId);
  }

  // Nested resource endpoints
  @Get(':id/contacts')
  async getContacts(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contactsService.findAll(tenantId, { companyId: id, page, limit });
  }

  @Get(':id/opportunities')
  async getOpportunities(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.opportunitiesService.findAll(tenantId, { companyId: id, page, limit });
  }

  @Get(':id/activities')
  async getActivities(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.findAll(tenantId, { companyId: id, page, limit });
  }

  @Get(':id/orders')
  async getOrders(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.companiesService.getCompanyOrders(tenantId, id, { page, limit });
  }

  @Post(':id/sync-hubspot')
  async syncHubspot(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.companiesService.syncToHubspot(tenantId, id, userId);
  }

  @Patch(':id/assign')
  async assignRep(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { salesRepId?: string; opsRepId?: string },
  ) {
    return this.companiesService.assignReps(tenantId, id, userId, dto);
  }

  @Patch(':id/tier')
  async updateTier(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { tier: string },
  ) {
    return this.companiesService.updateTier(tenantId, id, userId, dto.tier);
  }
}
