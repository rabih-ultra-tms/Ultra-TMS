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
import { ContactsService } from './contacts.service';
import { ActivitiesService } from './activities.service';
import { CreateContactDto, UpdateContactDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Get()
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
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.contactsService.findOne(tenantId, id);
  }

  @Post()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(tenantId, userId, dto);
  }

  @Put(':id')
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
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER')
  async syncHubspot(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.syncToHubspot(tenantId, id, userId);
  }

  @Patch(':id/set-primary')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async setPrimary(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.contactsService.setPrimary(tenantId, id, userId);
  }
}
