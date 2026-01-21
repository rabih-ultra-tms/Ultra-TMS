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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { ContactsService } from './contacts.service';
import { ActivitiesService } from './activities.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('crm/contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Contacts')
@ApiBearerAuth('JWT-auth')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List contacts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardResponse('Contacts list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.contactsService.findAll(tenantId, { page, limit, companyId, status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiStandardResponse('Contact details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.contactsService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create contact' })
  @ApiStandardResponse('Contact created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiStandardResponse('Contact updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiStandardResponse('Contact deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_MANAGER')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.delete(tenantId, id, userId);
  }

  // Nested resource endpoints
  @Get(':id/activities')
  @ApiOperation({ summary: 'List contact activities' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Contact activities list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getActivities(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.findAll(tenantId, { contactId: id, page, limit });
  }

  @Post(':id/sync-hubspot')
  @ApiOperation({ summary: 'Sync contact to HubSpot' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiStandardResponse('Contact synced to HubSpot')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async syncHubspot(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.syncToHubspot(tenantId, id, userId);
  }

  @Patch(':id/set-primary')
  @ApiOperation({ summary: 'Set primary contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiStandardResponse('Primary contact set')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async setPrimary(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.setPrimary(tenantId, id, userId);
  }
}
