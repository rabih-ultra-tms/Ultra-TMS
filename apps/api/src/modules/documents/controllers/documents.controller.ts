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
import { DocumentsService } from '../services';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateDocumentDto) {
    return this.documentsService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('documentType') documentType?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string
  ) {
    return this.documentsService.findAll(
      req.user.tenantId,
      documentType,
      entityType,
      entityId
    );
  }

  @Get('entity/:entityType/:entityId')
  getByEntity(
    @Request() req: any,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string
  ) {
    return this.documentsService.getByEntity(
      req.user.tenantId,
      entityType,
      entityId
    );
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto
  ) {
    return this.documentsService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.remove(req.user.tenantId, id);
  }
}
