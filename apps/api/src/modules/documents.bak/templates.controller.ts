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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TemplatesService } from './templates.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateQueryDto,
} from './dto';

@UseGuards(JwtAuthGuard)
@Controller('documents/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(req.user.tenantId, req.user.sub, dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: TemplateQueryDto) {
    return this.templatesService.findAll(req.user.tenantId, query);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.templatesService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.templatesService.delete(req.user.tenantId, id);
  }

  @Post(':id/preview')
  async preview(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.templatesService.preview(req.user.tenantId, id, data);
  }
}
