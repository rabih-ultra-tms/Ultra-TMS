import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TemplatesService } from './templates.service';
import { CreateFromTemplateDto, CreateTemplateDto, UpdateTemplateDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('workflow-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Workflows')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'OPERATIONS_MANAGER')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List workflow templates' })
  @ApiStandardResponse('Workflow templates list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  findAll(@CurrentTenant() tenantId: string, @Query('category') category?: string) {
    return this.templatesService.findAll(tenantId, category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Workflow template details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create workflow template' })
  @ApiStandardResponse('Workflow template created')
  @ApiErrorResponses()
  @Roles('ADMIN')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Workflow template updated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Workflow template deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    await this.templatesService.delete(tenantId, id);
  }

  @Post(':id/create-workflow')
  @ApiOperation({ summary: 'Create workflow from template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Workflow created from template')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  createWorkflow(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateFromTemplateDto,
  ) {
    return this.templatesService.createWorkflowFromTemplate(tenantId, userId, id, dto);
  }
}
