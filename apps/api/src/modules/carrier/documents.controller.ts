import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateCarrierDocumentDto, UpdateCarrierDocumentDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

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
    @Param('carrierId') carrierId: string,
  ) {
    return this.documentsService.list(tenantId, carrierId);
  }

  @Post()
  @ApiOperation({ summary: 'Create carrier document' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiStandardResponse('Carrier document created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierDocumentDto,
  ) {
    return this.documentsService.create(tenantId, carrierId, dto);
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
    @Body() dto: UpdateCarrierDocumentDto,
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
    @Param('docId') docId: string,
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
    @Body() body: { reason: string },
  ) {
    return this.documentsService.reject(tenantId, carrierId, docId, body.reason, user?.id);
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
    @Param('docId') docId: string,
  ) {
    return this.documentsService.remove(tenantId, carrierId, docId);
  }
}
