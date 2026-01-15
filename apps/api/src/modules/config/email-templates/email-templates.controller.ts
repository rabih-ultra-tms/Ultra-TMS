import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { UpdateEmailTemplateDto } from '../dto';
import { EmailTemplatesService } from './email-templates.service';

@Controller('config/email-templates')
@UseGuards(JwtAuthGuard)
@ApiTags('Config')
@ApiBearerAuth('JWT-auth')
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(tenantId, id, dto, userId);
  }
}
