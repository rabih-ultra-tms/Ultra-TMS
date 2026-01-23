import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { CompaniesService } from './companies.service';
import { ContactsService } from './contacts.service';
import { OpportunitiesService } from './opportunities.service';
import { ActivitiesService } from './activities.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('crm/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Companies')
@ApiBearerAuth('JWT-auth')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly contactsService: ContactsService,
    private readonly opportunitiesService: OpportunitiesService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List companies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'companyType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'assignedUserId', required: false, type: String })
  @ApiStandardResponse('Companies list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
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
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Company details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.companiesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create company' })
  @ApiStandardResponse('Company created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Company updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Company deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.companiesService.delete(tenantId, id, userId);
  }

  // Nested resource endpoints
  @Get(':id/contacts')
  @ApiOperation({ summary: 'List company contacts' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Company contacts list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getContacts(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.contactsService.findAll(tenantId, { companyId: id, page, limit });
  }

  @Get(':id/opportunities')
  @ApiOperation({ summary: 'List company opportunities' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Company opportunities list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getOpportunities(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.opportunitiesService.findAll(tenantId, { companyId: id, page, limit });
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'List company activities' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Company activities list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getActivities(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.findAll(tenantId, { companyId: id, page, limit });
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'List company orders' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Company orders list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getOrders(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.companiesService.getCompanyOrders(tenantId, id, { page, limit });
  }

  @Post(':id/sync-hubspot')
  @ApiOperation({ summary: 'Sync company to HubSpot' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Company synced to HubSpot')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER')
  async syncHubspot(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.companiesService.syncToHubspot(tenantId, id, userId);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign reps to company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Company reps assigned')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async assignRep(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { salesRepId?: string; opsRepId?: string },
  ) {
    return this.companiesService.assignReps(tenantId, id, userId, dto);
  }

  @Patch(':id/tier')
  @ApiOperation({ summary: 'Update company tier' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiStandardResponse('Company tier updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async updateTier(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { tier: string },
  ) {
    return this.companiesService.updateTier(tenantId, id, userId, dto.tier);
  }
}
