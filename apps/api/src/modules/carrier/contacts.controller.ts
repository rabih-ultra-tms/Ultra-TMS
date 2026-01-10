import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ContactsService } from './contacts.service';
import { CreateCarrierContactDto, UpdateCarrierContactDto } from './dto';

@Controller('carriers/:carrierId/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.contactsService.list(tenantId, carrierId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierContactDto,
  ) {
    return this.contactsService.create(tenantId, carrierId, dto);
  }

  @Put(':contactId')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateCarrierContactDto,
  ) {
    return this.contactsService.update(tenantId, carrierId, contactId, dto);
  }

  @Delete(':contactId')
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.contactsService.remove(tenantId, carrierId, contactId);
  }
}
