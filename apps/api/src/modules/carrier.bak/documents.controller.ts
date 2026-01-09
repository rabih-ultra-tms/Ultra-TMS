import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { DocumentsService } from './documents.service';
import {
  CreateCarrierDocumentDto,
  UpdateCarrierDocumentDto,
  ReviewDocumentDto,
  DocumentListQueryDto,
} from './dto/document.dto';

@UseGuards(JwtAuthGuard)
@Controller('carriers/:carrierId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Query() query: DocumentListQueryDto
  ) {
    return this.documentsService.findAll(tenantId, carrierId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string
  ) {
    return this.documentsService.findOne(tenantId, carrierId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('carrierId') carrierId: string,
    @Body() dto: CreateCarrierDocumentDto
  ) {
    return this.documentsService.create(tenantId, carrierId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCarrierDocumentDto
  ) {
    return this.documentsService.update(tenantId, carrierId, id, dto);
  }

  @Patch(':id/review')
  async review(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string,
    @Body() dto: ReviewDocumentDto
  ) {
    return this.documentsService.review(tenantId, carrierId, id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('carrierId') carrierId: string,
    @Param('id') id: string
  ) {
    return this.documentsService.delete(tenantId, carrierId, id);
  }
}
