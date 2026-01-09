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
} from '@nestjs/common';
import { DocumentFoldersService } from '../services';
import {
  CreateDocumentFolderDto,
  UpdateDocumentFolderDto,
  AddDocumentToFolderDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('documents/folders')
@UseGuards(JwtAuthGuard)
export class DocumentFoldersController {
  constructor(private readonly foldersService: DocumentFoldersService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateDocumentFolderDto) {
    return this.foldersService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('parentFolderId') parentFolderId?: string
  ) {
    return this.foldersService.findAll(req.user.tenantId, parentFolderId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.foldersService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentFolderDto
  ) {
    return this.foldersService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.foldersService.remove(req.user.tenantId, id);
  }

  @Post(':id/documents')
  addDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddDocumentToFolderDto
  ) {
    return this.foldersService.addDocument(
      req.user.tenantId,
      id,
      dto,
      req.user.userId
    );
  }

  @Delete(':id/documents/:documentId')
  removeDocument(
    @Request() req: any,
    @Param('id') id: string,
    @Param('documentId') documentId: string
  ) {
    return this.foldersService.removeDocument(
      req.user.tenantId,
      id,
      documentId
    );
  }
}
