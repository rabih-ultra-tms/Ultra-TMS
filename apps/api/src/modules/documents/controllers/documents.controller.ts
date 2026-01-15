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
import { plainToInstance } from 'class-transformer';
import { DocumentsService } from '../services';
import { CreateDocumentDto, UpdateDocumentDto, DocumentDownloadDto, DocumentResponseDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DocumentAccessGuard } from '../guards/document-access.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@SerializeOptions({ excludeExtraneousValues: false })
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  create(@Request() req: any, @Body() createDto: CreateDocumentDto) {
    return this.documentsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
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
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE', 'CARRIER', 'CUSTOMER')
  @UseGuards(DocumentAccessGuard)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.tenantId, id)
      .then((document) => this.serializeDocument(document));
  }

  @Get(':id/download')
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE', 'CARRIER', 'CUSTOMER')
  @UseGuards(DocumentAccessGuard)
  async getDownload(@Request() req: any, @Param('id') id: string) {
    const download = await this.documentsService.getDownloadUrl(req.user.tenantId, id);
    return plainToInstance(DocumentDownloadDto, download, { excludeExtraneousValues: true });
  }

  @Patch(':id')
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
