import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierScopeGuard } from '../guards/carrier-scope.guard';
import { CarrierPortalDocumentsService } from './carrier-portal-documents.service';
import { CarrierDocumentType } from '@prisma/client';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { CarrierScope } from '../decorators/carrier-scope.decorator';
import type { CarrierScopeType } from '../decorators/carrier-scope.decorator';

@UseGuards(CarrierPortalAuthGuard, CarrierScopeGuard)
@Controller('carrier-portal')
@ApiTags('Carrier Portal')
@ApiBearerAuth('Portal-JWT')
export class CarrierPortalDocumentsController {
  constructor(private readonly documentsService: CarrierPortalDocumentsService) {}

  @Get('documents')
  @ApiOperation({ summary: 'List carrier documents' })
  @ApiStandardResponse('Carrier documents list')
  @ApiErrorResponses()
  list(@CarrierScope() scope: CarrierScopeType) {
    return this.documentsService.list(scope.tenantId, scope.id);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload carrier document' })
  @ApiStandardResponse('Carrier document uploaded')
  @ApiErrorResponses()
  upload(@Body() body: any, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.documentsService.upload(scope.tenantId, scope.id, req.carrierPortalUser.id, {
      loadId: body.loadId,
      fileName: body.fileName,
      fileSize: body.fileSize ?? 0,
      mimeType: body.mimeType ?? 'application/octet-stream',
      documentType: body.documentType as CarrierDocumentType,
    });
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get carrier document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Carrier document')
  @ApiErrorResponses()
  get(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.documentsService.get(scope.tenantId, scope.id, id);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete carrier document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Carrier document deleted')
  @ApiErrorResponses()
  delete(@Param('id') id: string, @CarrierScope() scope: CarrierScopeType) {
    return this.documentsService.delete(scope.tenantId, scope.id, id);
  }

  @Post('loads/:id/pod')
  @ApiOperation({ summary: 'Upload POD document' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('POD uploaded')
  @ApiErrorResponses()
  uploadPod(@Param('id') id: string, @Body() body: any, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.documentsService.upload(scope.tenantId, scope.id, req.carrierPortalUser.id, {
      loadId: id,
      fileName: body.fileName ?? 'pod.pdf',
      fileSize: body.fileSize ?? 0,
      mimeType: body.mimeType ?? 'application/pdf',
      documentType: CarrierDocumentType.POD,
    });
  }

  @Post('loads/:id/documents')
  @ApiOperation({ summary: 'Upload load document' })
  @ApiParam({ name: 'id', description: 'Load ID' })
  @ApiStandardResponse('Load document uploaded')
  @ApiErrorResponses()
  uploadLoadDoc(@Param('id') id: string, @Body() body: any, @CarrierScope() scope: CarrierScopeType, @Req() req: any) {
    return this.documentsService.upload(scope.tenantId, scope.id, req.carrierPortalUser.id, {
      loadId: id,
      fileName: body.fileName ?? 'document.pdf',
      fileSize: body.fileSize ?? 0,
      mimeType: body.mimeType ?? 'application/pdf',
      documentType: body.documentType as CarrierDocumentType,
    });
  }
}