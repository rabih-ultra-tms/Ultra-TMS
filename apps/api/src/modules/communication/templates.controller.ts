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
import { JwtAuthGuard } from '../auth/guards';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('communication/templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, userId, dto);
  }

  @Get()
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
  async getTemplateCodes() {
    return this.templatesService.getTemplateCodes();
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.delete(tenantId, id);
  }

  @Post(':id/clone')
  async clone(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.clone(tenantId, id, userId);
  }

  @Post('preview')
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
