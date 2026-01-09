import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant } from '../../common/decorators';
import { ContactsService } from './contacts.service';
import {
  CreateCarrierContactDto,
  UpdateCarrierContactDto,
} from './dto/contact.dto';

@UseGuards(JwtAuthGuard)
@Controller('carriers/:carrierId/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.contactsService.findAll(tenantId, carrierId);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string
  ) {
    return this.contactsService.findOne(tenantId, carrierId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierContactDto
  ) {
    return this.contactsService.create(tenantId, carrierId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierContactDto
  ) {
    return this.contactsService.update(tenantId, carrierId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string
  ) {
    return this.contactsService.delete(tenantId, carrierId, id);
  }
}
