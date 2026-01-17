import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ContactsService } from './contacts.service';
import { CreateCarrierContactDto, UpdateCarrierContactDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('carriers/:carrierId/contacts')
@UseGuards(JwtAuthGuard)
@ApiTags('Carrier')
@ApiBearerAuth('JWT-auth')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List carrier contacts' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier contacts list')
  @ApiErrorResponses()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.contactsService.list(tenantId, carrierId);
  }

  @Post()
  @ApiOperation({ summary: 'Create carrier contact' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier contact created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierContactDto,
  ) {
    return this.contactsService.create(tenantId, carrierId, dto);
  }

  @Put(':contactId')
  @ApiOperation({ summary: 'Update carrier contact' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'contactId', description: 'Contact ID' })
  @ApiStandardResponse('Carrier contact updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('contactId') contactId: string,
    @Body() dto: UpdateCarrierContactDto,
  ) {
    return this.contactsService.update(tenantId, carrierId, contactId, dto);
  }

  @Delete(':contactId')
  @ApiOperation({ summary: 'Delete carrier contact' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'contactId', description: 'Contact ID' })
  @ApiStandardResponse('Carrier contact deleted')
  @ApiErrorResponses()
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.contactsService.remove(tenantId, carrierId, contactId);
  }
}
