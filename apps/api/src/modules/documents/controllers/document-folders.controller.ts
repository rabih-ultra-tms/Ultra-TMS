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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DocumentFoldersService } from '../services';
import {
  CreateDocumentFolderDto,
  UpdateDocumentFolderDto,
  AddDocumentToFolderDto,
} from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('documents/folders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
export class DocumentFoldersController {
  constructor(private readonly foldersService: DocumentFoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create document folder' })
  @ApiStandardResponse('Document folder created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  create(@Request() req: any, @Body() createDto: CreateDocumentFolderDto) {
    return this.foldersService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List document folders' })
  @ApiQuery({ name: 'parentFolderId', required: false, type: String })
  @ApiStandardResponse('Document folders list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findAll(
    @Request() req: any,
    @Query('parentFolderId') parentFolderId?: string
  ) {
    return this.foldersService.findAll(req.user.tenantId, parentFolderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiStandardResponse('Document folder details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.foldersService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiStandardResponse('Document folder updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentFolderDto
  ) {
    return this.foldersService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiStandardResponse('Document folder deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.foldersService.remove(req.user.tenantId, id);
  }

  @Post(':id/documents')
  @ApiOperation({ summary: 'Add document to folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiStandardResponse('Document added to folder')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
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
  @ApiOperation({ summary: 'Remove document from folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiStandardResponse('Document removed from folder')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
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
