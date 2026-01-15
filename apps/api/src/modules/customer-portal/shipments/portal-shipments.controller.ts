import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PortalAuthGuard } from '../guards/portal-auth.guard';
import { CompanyScopeGuard } from '../guards/company-scope.guard';
import { PortalShipmentsService } from './portal-shipments.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CompanyScope } from '../decorators/company-scope.decorator';
import type { CompanyScopeType } from '../decorators/company-scope.decorator';

@UseGuards(PortalAuthGuard, CompanyScopeGuard)
@Controller('portal/shipments')
@ApiTags('Customer Portal')
@ApiBearerAuth('Portal-JWT')
export class PortalShipmentsController {
  constructor(private readonly shipmentsService: PortalShipmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List portal shipments' })
  @ApiStandardResponse('Portal shipments list')
  @ApiErrorResponses()
  list(@CompanyScope() scope: CompanyScopeType) {
    return this.shipmentsService.list(scope.tenantId, scope.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment details' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiStandardResponse('Shipment details')
  @ApiErrorResponses()
  detail(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.shipmentsService.detail(scope.tenantId, scope.id, id);
  }

  @Get(':id/tracking')
  @ApiOperation({ summary: 'Get shipment tracking' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiStandardResponse('Shipment tracking')
  @ApiErrorResponses()
  tracking(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.shipmentsService.tracking(scope.tenantId, scope.id, id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get shipment events' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiStandardResponse('Shipment events')
  @ApiErrorResponses()
  events(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.shipmentsService.events(scope.tenantId, scope.id, id);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get shipment documents' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiStandardResponse('Shipment documents')
  @ApiErrorResponses()
  documents(@Param('id') id: string, @CompanyScope() scope: CompanyScopeType) {
    return this.shipmentsService.documents(scope.tenantId, scope.id, id);
  }

  @Post(':id/contact')
  @ApiOperation({ summary: 'Contact shipment team' })
  @ApiParam({ name: 'id', description: 'Shipment ID' })
  @ApiStandardResponse('Shipment contact message sent')
  @ApiErrorResponses()
  contact(@Param('id') id: string, @Body('message') message: string, @CompanyScope() scope: CompanyScopeType, @Req() req: any) {
    return this.shipmentsService.contact(
      scope.tenantId,
      scope.id,
      id,
      message,
      req.portalUser.id,
    );
  }
}