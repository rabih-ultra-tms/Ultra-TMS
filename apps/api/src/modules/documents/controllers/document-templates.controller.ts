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
import { DocumentTemplatesService } from '../services';
import { CreateDocumentTemplateDto, UpdateDocumentTemplateDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('documents/templates')
@UseGuards(JwtAuthGuard)
export class DocumentTemplatesController {
  constructor(private readonly templatesService: DocumentTemplatesService) {}

  @Post()
  create(@Request() req: any, @Body() createDto: CreateDocumentTemplateDto) {
    return this.templatesService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  findAll(@Request() req: any, @Query('templateType') templateType?: string) {
    return this.templatesService.findAll(req.user.tenantId, templateType);
  }

  @Get('default/:templateType')
  getDefault(@Request() req: any, @Param('templateType') templateType: string) {
    return this.templatesService.getDefault(req.user.tenantId, templateType);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentTemplateDto
  ) {
    return this.templatesService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.remove(req.user.tenantId, id);
  }
}
