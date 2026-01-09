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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { TemplatesService } from './templates.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  UseTemplateDto,
} from './dto';

@Controller('workflow-templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: string,
  ) {
    return this.templatesService.findAll(tenantId, category);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.templatesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.templatesService.create(tenantId, userId, dto);
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.templatesService.delete(tenantId, id);
  }

  @Post(':id/use')
  async useTemplate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UseTemplateDto,
  ) {
    return this.templatesService.useTemplate(tenantId, id, userId, dto);
  }
}
