import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { WidgetsService } from './widgets.service';
import { CreateWidgetDto } from '../dto/feedback.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('feedback/widgets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class WidgetsController {
  constructor(private readonly widgets: WidgetsService) {}

  @Get()
  @ApiOperation({ summary: 'List feedback widgets' })
  @ApiStandardResponse('Feedback widgets list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.widgets.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create feedback widget' })
  @ApiStandardResponse('Feedback widget created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateWidgetDto) {
    return this.widgets.create(tenantId, dto);
  }
}
