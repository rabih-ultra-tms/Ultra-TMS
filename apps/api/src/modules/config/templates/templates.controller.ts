import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { ApplyTemplateDto } from '../dto';
import { TemplatesService } from './templates.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('config/templates')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List config templates' })
  @ApiStandardResponse('Config templates list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post(':code/apply')
  @ApiOperation({ summary: 'Apply config template' })
  @ApiParam({ name: 'code', description: 'Template code' })
  @ApiStandardResponse('Config template applied')
  @ApiErrorResponses()
  apply(
    @Param('code') code: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: ApplyTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.apply(code, tenantId, dto, userId);
  }
}
