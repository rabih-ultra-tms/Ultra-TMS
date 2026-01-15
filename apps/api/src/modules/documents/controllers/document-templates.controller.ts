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
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';

@Controller('documents/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentTemplatesController {
  constructor(private readonly templatesService: DocumentTemplatesService) {}

  @Post()
  @Roles('ADMIN', 'COMPLIANCE')
  create(@Request() req: any, @Body() createDto: CreateDocumentTemplateDto) {
    return this.templatesService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findAll(@Request() req: any, @Query('templateType') templateType?: string) {
    return this.templatesService.findAll(req.user.tenantId, templateType);
  }

  @Get('default/:templateType')
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  getDefault(@Request() req: any, @Param('templateType') templateType: string) {
    return this.templatesService.getDefault(req.user.tenantId, templateType);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'COMPLIANCE')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentTemplateDto
  ) {
    return this.templatesService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'COMPLIANCE')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.remove(req.user.tenantId, id);
  }
}
