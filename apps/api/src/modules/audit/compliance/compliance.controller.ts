import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { CheckpointService } from './checkpoint.service';
import { CreateComplianceCheckpointDto } from '../dto';

@Controller('audit/compliance/checkpoints')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
export class ComplianceController {
  constructor(private readonly service: CheckpointService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateComplianceCheckpointDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id/verify')
  verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.verify(tenantId, id, userId);
  }
}
