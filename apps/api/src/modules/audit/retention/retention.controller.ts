import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, Roles } from '../../../common/decorators';
import { RetentionService } from './retention.service';
import { CreateRetentionPolicyDto, UpdateRetentionPolicyDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit/retention')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class RetentionController {
  constructor(private readonly service: RetentionService) {}

  @Get()
  @ApiOperation({ summary: 'List retention policies' })
  @ApiStandardResponse('Retention policies list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create retention policy' })
  @ApiStandardResponse('Retention policy created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateRetentionPolicyDto) {
    return this.service.create(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update retention policy' })
  @ApiParam({ name: 'id', description: 'Retention policy ID' })
  @ApiStandardResponse('Retention policy updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateRetentionPolicyDto) {
    return this.service.update(tenantId, id, dto);
  }
}
