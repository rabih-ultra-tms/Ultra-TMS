import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { ApplyTemplateDto } from '../dto';
import { TemplatesService } from './templates.service';

@Controller('config/templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post(':code/apply')
  apply(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: ApplyTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.apply(code, tenantId, dto, userId);
  }
}
