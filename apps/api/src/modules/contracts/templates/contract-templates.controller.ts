import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ContractTemplatesService } from './contract-templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentUser, CurrentUserData } from '../../../common/decorators/current-user.decorator';

@Controller('contract-templates')
@UseGuards(JwtAuthGuard)
export class ContractTemplatesController {
  constructor(private readonly templatesService: ContractTemplatesService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserData) {
    return this.templatesService.list(user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.create(user.tenantId, user.userId, dto);
  }

  @Get(':id')
  detail(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.detail(user.tenantId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.delete(user.tenantId, id);
  }

  @Post(':id/clone')
  clone(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
    return this.templatesService.clone(user.tenantId, id, user.userId);
  }
}
