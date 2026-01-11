import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EdiDocumentsService } from './edi-documents.service';
import { AcknowledgeEdiDocumentDto } from './dto/acknowledge-edi-document.dto';
import { DocumentQueryDto } from './dto/document-query.dto';
import { ImportEdiDocumentDto } from './dto/import-edi-document.dto';
import { ReprocessDocumentDto } from './dto/reprocess-document.dto';

@Controller('edi/documents')
@UseGuards(JwtAuthGuard)
export class EdiDocumentsController {
  constructor(private readonly service: EdiDocumentsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @Query() query: DocumentQueryDto) {
    return this.service.list(tenantId, query);
  }

  @Get('errors')
  listErrors(@CurrentTenant() tenantId: string) {
    return this.service.listErrors(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/raw')
  raw(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.rawContent(tenantId, id);
  }

  @Get(':id/parsed')
  parsed(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.parsedContent(tenantId, id);
  }

  @Post(':id/reprocess')
  reprocess(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: ReprocessDocumentDto,
  ) {
    return this.service.reprocess(tenantId, id, dto);
  }

  @Post(':id/acknowledge')
  acknowledge(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AcknowledgeEdiDocumentDto,
  ) {
    return this.service.acknowledge(tenantId, id, dto);
  }

  @Post('import')
  import(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ImportEdiDocumentDto,
  ) {
    return this.service.importDocument(tenantId, user.id, dto);
  }
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class EdiOrderDocumentsController {
  constructor(private readonly service: EdiDocumentsService) {}

  @Get(':orderId/edi-documents')
  listForOrder(@CurrentTenant() tenantId: string, @Param('orderId') orderId: string) {
    return this.service.listByOrder(tenantId, orderId);
  }
}

@Controller('loads')
@UseGuards(JwtAuthGuard)
export class EdiLoadDocumentsController {
  constructor(private readonly service: EdiDocumentsService) {}

  @Get(':loadId/edi-documents')
  listForLoad(@CurrentTenant() tenantId: string, @Param('loadId') loadId: string) {
    return this.service.listByLoad(tenantId, loadId);
  }
}
