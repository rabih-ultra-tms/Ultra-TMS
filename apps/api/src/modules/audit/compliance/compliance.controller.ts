import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { CheckpointService } from './checkpoint.service';
import { CreateComplianceCheckpointDto } from '../dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('audit/compliance/checkpoints')
@UseGuards(JwtAuthGuard)
@Roles('COMPLIANCE', 'ADMIN', 'SUPER_ADMIN')
@ApiTags('Audit')
@ApiBearerAuth('JWT-auth')
export class ComplianceController {
  constructor(private readonly service: CheckpointService) {}

  @Get()
  @ApiOperation({ summary: 'List compliance checkpoints' })
  @ApiStandardResponse('Compliance checkpoints list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create compliance checkpoint' })
  @ApiStandardResponse('Compliance checkpoint created')
  @ApiErrorResponses()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateComplianceCheckpointDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Verify compliance checkpoint' })
  @ApiParam({ name: 'id', description: 'Checkpoint ID' })
  @ApiStandardResponse('Compliance checkpoint verified')
  @ApiErrorResponses()
  verify(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.verify(tenantId, id, userId);
  }
}
