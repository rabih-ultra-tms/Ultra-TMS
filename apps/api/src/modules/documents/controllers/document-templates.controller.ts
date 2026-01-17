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
import { DocumentTemplatesService } from '../services';
import { CreateDocumentTemplateDto, UpdateDocumentTemplateDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('documents/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
export class DocumentTemplatesController {
  constructor(private readonly templatesService: DocumentTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create document template' })
  @ApiStandardResponse('Document template created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  create(@Request() req: any, @Body() createDto: CreateDocumentTemplateDto) {
    return this.templatesService.create(
      req.user.tenantId,
      createDto,
      req.user.userId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List document templates' })
  @ApiQuery({ name: 'templateType', required: false, type: String })
  @ApiStandardResponse('Document templates list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findAll(@Request() req: any, @Query('templateType') templateType?: string) {
    return this.templatesService.findAll(req.user.tenantId, templateType);
  }

  @Get('default/:templateType')
  @ApiOperation({ summary: 'Get default template by type' })
  @ApiParam({ name: 'templateType', description: 'Template type' })
  @ApiStandardResponse('Default document template')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  getDefault(@Request() req: any, @Param('templateType') templateType: string) {
    return this.templatesService.getDefault(req.user.tenantId, templateType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Document template details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS', 'ACCOUNTING', 'COMPLIANCE')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Document template updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentTemplateDto
  ) {
    return this.templatesService.update(req.user.tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Document template deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'COMPLIANCE')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.templatesService.remove(req.user.tenantId, id);
  }
}
