import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EdiDocumentsService } from './edi-documents.service';
import { AcknowledgeEdiDocumentDto } from './dto/acknowledge-edi-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { ImportEdiDocumentDto } from './dto/import-edi-document.dto';
import { ReprocessDocumentDto } from './dto/reprocess-document.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('edi/documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('EDI Documents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
export class EdiDocumentsController {
  constructor(private readonly service: EdiDocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List EDI documents' })
  @ApiStandardResponse('EDI documents list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  list(@CurrentTenant() tenantId: string, @Query() query: DocumentQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Get('errors')
  @ApiOperation({ summary: 'List EDI document errors' })
  @ApiStandardResponse('EDI document errors')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  listErrors(@CurrentTenant() tenantId: string) {
    return this.service.listErrors(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get EDI document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('EDI document details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/raw')
  @ApiOperation({ summary: 'Get raw EDI document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Raw EDI document')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  raw(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.rawContent(tenantId, id);
  }

  @Get(':id/parsed')
  @ApiOperation({ summary: 'Get parsed EDI document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Parsed EDI document')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  parsed(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.parsedContent(tenantId, id);
  }

  @Post(':id/reprocess')
  @ApiOperation({ summary: 'Reprocess EDI document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('EDI document reprocessed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  reprocess(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReprocessDocumentDto,
  ) {
    return this.service.reprocess(tenantId, id, dto);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge EDI document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('EDI document acknowledged')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  acknowledge(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AcknowledgeEdiDocumentDto,
  ) {
    return this.service.acknowledge(tenantId, id, dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import EDI documents' })
  @ApiStandardResponse('EDI documents imported')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER')
  import(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ImportEdiDocumentDto,
  ) {
    return this.service.importDocument(tenantId, user.id, dto);
  }
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('EDI Documents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
export class EdiOrderDocumentsController {
  constructor(private readonly service: EdiDocumentsService) {}

  @Get(':orderId/edi-documents')
  @ApiOperation({ summary: 'List EDI documents for order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiStandardResponse('Order EDI documents list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  listForOrder(@CurrentTenant() tenantId: string, @Param('orderId') orderId: string) {
    return this.service.listByOrder(tenantId, orderId);
  }
}

@Controller('loads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('EDI Documents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
export class EdiLoadDocumentsController {
  constructor(private readonly service: EdiDocumentsService) {}

  @Get(':loadId/edi-documents')
  @ApiOperation({ summary: 'List EDI documents for load' })
  @ApiParam({ name: 'loadId', description: 'Load ID' })
  @ApiStandardResponse('Load EDI documents list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'EDI_MANAGER', 'OPERATIONS_MANAGER')
  listForLoad(@CurrentTenant() tenantId: string, @Param('loadId') loadId: string) {
    return this.service.listByLoad(tenantId, loadId);
  }
}
