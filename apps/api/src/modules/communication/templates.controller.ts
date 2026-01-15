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
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('communication/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles('ADMIN')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, userId, dto);
  }

  @Get()
  @Roles('ADMIN', 'MARKETING')
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
  async getTemplateCodes() {
    return this.templatesService.getTemplateCodes();
  }

  @Get(':id')
  @Roles('ADMIN', 'MARKETING')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.delete(tenantId, id);
  }

  @Post(':id/clone')
  @Roles('ADMIN', 'MARKETING')
  async clone(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.clone(tenantId, id, userId);
  }

  @Post('preview')
  @Roles('ADMIN', 'MARKETING')
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
