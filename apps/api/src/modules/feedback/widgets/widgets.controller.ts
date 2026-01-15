import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant } from '../../../common/decorators';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from '../dto/feedback.dto';

@Controller('feedback/widgets')
@UseGuards(JwtAuthGuard)
export class WidgetsController {
  constructor(private readonly widgets: WidgetsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.widgets.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateWidgetDto) {
    return this.widgets.create(tenantId, dto);
  }
}
