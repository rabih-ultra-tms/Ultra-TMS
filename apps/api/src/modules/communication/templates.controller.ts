import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('communication/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Communication')
@ApiBearerAuth('JWT-auth')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create communication template' })
  @ApiStandardResponse('Template created')
  @ApiErrorResponses()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, userId, dto);
  }

  @Get()
  @Roles('ADMIN', 'MARKETING')
  @ApiOperation({ summary: 'List communication templates' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'channel', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardResponse('Templates list')
  @ApiErrorResponses()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('channel') channel?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.templatesService.findAll(tenantId, {
      page,
      limit,
      channel,
      category,
      status,
      search,
    });
  }

  @Get('codes')
  @Roles('ADMIN', 'MARKETING')
  @ApiOperation({ summary: 'List template codes' })
  @ApiStandardResponse('Template codes list')
  @ApiErrorResponses()
  async getTemplateCodes() {
    return this.templatesService.getTemplateCodes();
  }

  @Get(':id')
  @Roles('ADMIN', 'MARKETING')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Template details')
  @ApiErrorResponses()
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Template updated')
  @ApiErrorResponses()
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Template deleted')
  @ApiErrorResponses()
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.delete(tenantId, id);
  }

  @Post(':id/clone')
  @Roles('ADMIN', 'MARKETING')
  @ApiOperation({ summary: 'Clone template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiStandardResponse('Template cloned')
  @ApiErrorResponses()
  async clone(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.clone(tenantId, id, userId);
  }

  @Post('preview')
  @Roles('ADMIN', 'MARKETING')
  @ApiOperation({ summary: 'Preview template' })
  @ApiStandardResponse('Template preview rendered')
  @ApiErrorResponses()
  async preview(
    @CurrentTenant() tenantId: string,
    @Body()
    body: {
      templateId: string;
      variables?: Record<string, any>;
      language?: 'en' | 'es';
    },
  ) {
    return this.templatesService.preview(
      tenantId,
      body.templateId,
      body.variables || {},
      body.language || 'en',
    );
  }
}
