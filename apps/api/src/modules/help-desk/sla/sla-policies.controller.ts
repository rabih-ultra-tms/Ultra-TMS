import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { SlaService } from './sla.service';
import { CreateSlaPolicyDto, UpdateSlaPolicyDto } from '../dto/help-desk.dto';

@Controller('support/sla-policies')
@UseGuards(JwtAuthGuard)
export class SlaPoliciesController {
  constructor(private readonly slaService: SlaService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.slaService.listPolicies(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string, @Body() dto: CreateSlaPolicyDto) {
    return this.slaService.createPolicy(tenantId, userId, dto);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSlaPolicyDto,
  ) {
    return this.slaService.updatePolicy(tenantId, userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.slaService.deletePolicy(tenantId, id);
  }
}
