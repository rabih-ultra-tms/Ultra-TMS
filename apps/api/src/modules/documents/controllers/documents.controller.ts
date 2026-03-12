import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Inject,
  SerializeOptions,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { DocumentsService } from '../services';
import { CreateDocumentDto, UpdateDocumentDto, UploadDocumentBodyDto, DocumentDownloadDto, DocumentResponseDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DocumentAccessGuard } from '../guards/document-access.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import type { IStorageService } from '../../storage/storage.interface';
import { STORAGE_SERVICE } from '../../storage/storage.module';
import { getDocumentUploadOptions } from '../../../common/utils/file-upload.util';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document file with metadata' })
  @ApiConsumes('multipart/form-data')
  @ApiStandardResponse('Document uploaded')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }))
  async upload(@Request() req: any, @UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type "${file.mimetype}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (!body.name || !body.documentType) {
      throw new BadRequestException('Missing required fields: name, documentType');
    }

    const document = await this.documentsService.uploadAndCreate(
      req.user.tenantId,
      file,
      {
        name: body.name,
        documentType: body.documentType,
        description: body.description,
        entityType: body.entityType,
        entityId: body.entityId,
        loadId: body.loadId,
        orderId: body.orderId,
        carrierId: body.carrierId,
        companyId: body.companyId,
        tags: body.tags ? (Array.isArray(body.tags) ? body.tags : [body.tags]) : undefined,
        isPublic: body.isPublic === 'true',
      },
      req.user.userId,
    );

    return { data: document };
  }

  @Post()
  @ApiOperation({ summary: 'Upload document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multipart form data with file and metadata fields',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string' },
        documentType: { type: 'string' },
        entityType: { type: 'string' },
        entityId: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['file', 'name', 'documentType'],
    },
  })
  @ApiStandardResponse('Document created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  @UseInterceptors(FileInterceptor('file', getDocumentUploadOptions()))
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentBodyDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload file to storage
    const fileExtension = file.originalname.split('.').pop() || '';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const folder = body.entityType
      ? `documents/${body.entityType.toLowerCase()}`
      : 'documents';

    const filePath = await this.storageService.upload(
      file.buffer,
      uniqueName,
      folder,
    );

    // Build DTO from form fields + uploaded file metadata
    const createDto: CreateDocumentDto = {
      name: body.name,
      documentType: body.documentType as any,
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileExtension,
      entityType: body.entityType as any,
      entityId: body.entityId,
      description: body.description,
      loadId: body.loadId,
      orderId: body.orderId,
      carrierId: body.carrierId,
      companyId: body.companyId,
      tags: body.tags ? body.tags.split(',').map((t) => t.trim()) : undefined,
    };

    return this.documentsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId,
    );
  }

  /**
   * POST /documents/metadata
   * Create a document record without file upload (for external/pre-uploaded files)
   */
  @Post('metadata')
  @ApiOperation({ summary: 'Create document record (metadata only, no file upload)' })
  @ApiStandardResponse('Document created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  createFromMetadata(@Request() req: any, @Body() createDto: CreateDocumentDto) {
    return this.documentsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  @ApiQuery({ name: 'documentType', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiStandardResponse('Documents list', DocumentResponseDto)
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findAll(
    @Request() req: any,
    @Query('documentType') documentType?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.documentsService.findAll(
      req.user.tenantId,
      documentType,
      entityType,
      entityId,
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    ).then((result) => ({
      ...result,
      data: this.serializeDocuments(result.data),
    }));
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'List documents for entity' })
  @ApiParam({ name: 'entityType', description: 'Entity type' })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiStandardResponse('Entity documents list', DocumentResponseDto)
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  getByEntity(
    @Request() req: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ) {
    return this.documentsService.getByEntity(
      req.user.tenantId,
      entityType,
      entityId
    ).then((documents) => this.serializeDocuments(documents));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Document details', DocumentResponseDto)
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE', 'CARRIER', 'CUSTOMER')
  @UseGuards(DocumentAccessGuard)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.tenantId, id)
      .then((document) => this.serializeDocument(document));
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get document download URL' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Document download URL', DocumentDownloadDto)
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE', 'CARRIER', 'CUSTOMER')
  @UseGuards(DocumentAccessGuard)
  async getDownload(@Request() req: any, @Param('id') id: string) {
    const download = await this.documentsService.getDownloadUrl(req.user.tenantId, id);
    return plainToInstance(DocumentDownloadDto, download, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Document updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  @UseGuards(DocumentAccessGuard)
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto
  ) {
    return this.documentsService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiStandardResponse('Document deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  @UseGuards(DocumentAccessGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.remove(req.user.tenantId, id);
  }

  private serializeDocument(document: unknown) {
    return plainToInstance(DocumentResponseDto, document, { excludeExtraneousValues: false });
  }

  private serializeDocuments(documents: unknown[]) {
    return plainToInstance(DocumentResponseDto, documents, { excludeExtraneousValues: false });
  }
}
