import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateJobDto } from '../dto/job.dto';
import { TemplatesService } from './templates.service';

@Controller('jobs/templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':code')
  get(@Param('code') code: string) {
    return this.service.get(code);
  }

  @Post(':code/create')
  createFromTemplate(
    @Param('code') code: string,
    @Body() overrides: Partial<CreateJobDto>,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createFromTemplate(code, overrides, tenantId, userId);
  }
}
