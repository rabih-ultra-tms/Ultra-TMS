import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { RetentionService } from './retention.service';
import { CreateRetentionPolicyDto, UpdateRetentionPolicyDto } from '../dto';

@Controller('audit/retention')
@UseGuards(JwtAuthGuard)
export class RetentionController {
  constructor(private readonly service: RetentionService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateRetentionPolicyDto) {
    return this.service.create(tenantId, dto);
  }

  @Put(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateRetentionPolicyDto) {
    return this.service.update(tenantId, id, dto);
  }
}
