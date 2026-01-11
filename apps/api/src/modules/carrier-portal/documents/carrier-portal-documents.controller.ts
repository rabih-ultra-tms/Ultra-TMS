import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CarrierPortalAuthGuard } from '../guards/carrier-portal-auth.guard';
import { CarrierPortalDocumentsService } from './carrier-portal-documents.service';
import { CarrierDocumentType } from '@prisma/client';

@UseGuards(CarrierPortalAuthGuard)
@Controller('carrier-portal')
export class CarrierPortalDocumentsController {
  constructor(private readonly documentsService: CarrierPortalDocumentsService) {}

  @Get('documents')
  list(@Req() req: any) {
    return this.documentsService.list(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId);
  }

  @Post('documents')
  upload(@Body() body: any, @Req() req: any) {
    return this.documentsService.upload(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id, {
      loadId: body.loadId,
      fileName: body.fileName,
      fileSize: body.fileSize ?? 0,
      mimeType: body.mimeType ?? 'application/octet-stream',
      documentType: body.documentType as CarrierDocumentType,
    });
  }

  @Get('documents/:id')
  get(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.get(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Delete('documents/:id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.delete(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, id);
  }

  @Post('loads/:id/pod')
  uploadPod(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentsService.upload(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id, {
      loadId: id,
      fileName: body.fileName ?? 'pod.pdf',
      fileSize: body.fileSize ?? 0,
      mimeType: body.mimeType ?? 'application/pdf',
      documentType: CarrierDocumentType.POD,
    });
  }

  @Post('loads/:id/documents')
  uploadLoadDoc(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.documentsService.upload(req.carrierPortalUser.tenantId, req.carrierPortalUser.carrierId, req.carrierPortalUser.id, {
      loadId: id,
      fileName: body.fileName ?? 'document.pdf',
      fileSize: body.fileSize ?? 0,
      mimeType: body.mimeType ?? 'application/pdf',
      documentType: body.documentType as CarrierDocumentType,
    });
  }
}