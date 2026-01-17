import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { UpdateEmailTemplateDto } from '../dto';
import { EmailTemplatesService } from './email-templates.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('config/email-templates')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List email templates' })
  @ApiStandardResponse('Email templates list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get email template by ID' })
  @ApiParam({ name: 'id', description: 'Email template ID' })
  @ApiStandardResponse('Email template details')
  @ApiErrorResponses()
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update email template' })
  @ApiParam({ name: 'id', description: 'Email template ID' })
  @ApiStandardResponse('Email template updated')
  @ApiErrorResponses()
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(tenantId, id, dto, userId);
  }
}
