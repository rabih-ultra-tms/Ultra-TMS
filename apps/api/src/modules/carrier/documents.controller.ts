import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateCarrierDocumentDto, UpdateCarrierDocumentDto } from './dto';

@Controller('carriers/:carrierId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
  ) {
    return this.documentsService.list(tenantId, carrierId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierDocumentDto,
  ) {
    return this.documentsService.create(tenantId, carrierId, dto);
  }

  @Put(':docId')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string,
    @Body() dto: UpdateCarrierDocumentDto,
  ) {
    return this.documentsService.update(tenantId, carrierId, docId, dto);
  }

  @Post(':docId/approve')
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.approve(tenantId, carrierId, docId, user?.id);
  }

  @Post(':docId/reject')
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
  async remove(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.remove(tenantId, carrierId, docId);
  }
}
