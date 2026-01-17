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
  SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { DocumentsService } from '../services';
import { CreateDocumentDto, UpdateDocumentDto, DocumentDownloadDto, DocumentResponseDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DocumentAccessGuard } from '../guards/document-access.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create document' })
  @ApiStandardResponse('Document created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  create(@Request() req: any, @Body() createDto: CreateDocumentDto) {
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
