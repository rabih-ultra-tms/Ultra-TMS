import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentQueryDto,
  BulkDocumentDeleteDto,
} from './dto';

// Type for uploaded file
interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination?: string;
  filename?: string;
  path?: string;
  buffer: Buffer;
}

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
      fileFilter: (_req, file, cb) => {
        const allowedMimes = [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/tiff',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      },
    }),
  )
  async upload(
    @Req() req: any,
    @UploadedFile() file: UploadedFileType,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(req.user.tenantId, req.user.sub, dto, file);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: DocumentQueryDto) {
    return this.documentsService.findAll(req.user.tenantId, query);
  }

  @Get('search')
  async search(
    @Req() req: any,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ) {
    return this.documentsService.search(req.user.tenantId, searchTerm, limit);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @Req() req: any,
    @Param('id') id: string,
    @Query('hard') hardDelete?: boolean,
  ) {
    return this.documentsService.delete(req.user.tenantId, id, hardDelete);
  }

  @Post('bulk-delete')
  async bulkDelete(@Req() req: any, @Body() dto: BulkDocumentDeleteDto) {
    return this.documentsService.bulkDelete(req.user.tenantId, dto.documentIds);
  }

  @Get(':id/download')
  async getDownloadUrl(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getDownloadUrl(req.user.tenantId, id);
  }

  @Get(':id/preview')
  async getPreviewUrl(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getPreviewUrl(req.user.tenantId, id);
  }

  @Post(':id/version')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVersion(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    return this.documentsService.uploadNewVersion(
      req.user.tenantId,
      req.user.sub,
      id,
      file,
    );
  }

  @Get(':id/versions')
  async getVersions(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getVersions(req.user.tenantId, id);
  }
}

// Entity-specific document endpoints
@UseGuards(JwtAuthGuard)
@Controller()
export class EntityDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('loads/:id/documents')
  async getLoadDocuments(
    @Req() req: any,
    @Param('id') id: string,
    @Query('type') documentType?: string,
  ) {
    return this.documentsService.getEntityDocuments(
      req.user.tenantId,
      'LOAD',
      id,
      documentType,
    );
  }

  @Get('carriers/:id/documents')
  async getCarrierDocuments(
    @Req() req: any,
    @Param('id') id: string,
    @Query('type') documentType?: string,
  ) {
    return this.documentsService.getEntityDocuments(
      req.user.tenantId,
      'CARRIER',
      id,
      documentType,
    );
  }

  @Get('companies/:id/documents')
  async getCompanyDocuments(
    @Req() req: any,
    @Param('id') id: string,
    @Query('type') documentType?: string,
  ) {
    return this.documentsService.getEntityDocuments(
      req.user.tenantId,
      'COMPANY',
      id,
      documentType,
    );
  }

  @Get('orders/:id/documents')
  async getOrderDocuments(
    @Req() req: any,
    @Param('id') id: string,
    @Query('type') documentType?: string,
  ) {
    return this.documentsService.getEntityDocuments(
      req.user.tenantId,
      'ORDER',
      id,
      documentType,
    );
  }
}
