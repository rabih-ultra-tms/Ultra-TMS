import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateCarrierDocumentDto, UpdateCarrierDocumentDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { getDocumentUploadOptions } from '../../common/utils/file-upload.util';

@Controller('carriers/:carrierId/documents')
@UseGuards(JwtAuthGuard)
@ApiTags('Carrier')
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List carrier documents' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier documents list')
  @ApiErrorResponses()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string
  ) {
    return this.documentsService.list(tenantId, carrierId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', getDocumentUploadOptions()))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create carrier document (with optional file upload)',
  })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier document created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierDocumentDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.documentsService.create(tenantId, carrierId, dto, file);
  }

  @Get(':docId/download')
  @ApiOperation({ summary: 'Get download URL for carrier document' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'docId', description: 'Document ID' })
  @ApiStandardResponse('Download URL')
  @ApiErrorResponses()
  async getDownloadUrl(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string
  ) {
    return this.documentsService.getDownloadUrl(tenantId, carrierId, docId);
  }

  @Put(':docId')
  @ApiOperation({ summary: 'Update carrier document' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'docId', description: 'Document ID' })
  @ApiStandardResponse('Carrier document updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string,
    @Body() dto: UpdateCarrierDocumentDto
  ) {
    return this.documentsService.update(tenantId, carrierId, docId, dto);
  }

  @Post(':docId/approve')
  @ApiOperation({ summary: 'Approve carrier document' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'docId', description: 'Document ID' })
  @ApiStandardResponse('Carrier document approved')
  @ApiErrorResponses()
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string
  ) {
    return this.documentsService.approve(tenantId, carrierId, docId, user?.id);
  }

  @Post(':docId/reject')
  @ApiOperation({ summary: 'Reject carrier document' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'docId', description: 'Document ID' })
  @ApiStandardResponse('Carrier document rejected')
  @ApiErrorResponses()
  async reject(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string,
    @Body() body: { reason: string }
  ) {
    return this.documentsService.reject(
      tenantId,
      carrierId,
      docId,
      body.reason,
      user?.id
    );
  }

  @Delete(':docId')
  @ApiOperation({ summary: 'Delete carrier document' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiParam({ name: 'docId', description: 'Document ID' })
  @ApiStandardResponse('Carrier document deleted')
  @ApiErrorResponses()
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string
  ) {
    return this.documentsService.remove(tenantId, carrierId, docId);
  }
}
