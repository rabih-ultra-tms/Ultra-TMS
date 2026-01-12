import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators';
import { LeadsService } from './leads.service';
import {
  AssignLeadDto,
  ContactLeadDto,
  ConvertLeadDto,
  LeadQueryDto,
  QualifyLeadDto,
  UpdateLeadDto,
} from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('api/v1/load-board/leads')
  list(@CurrentTenant() tenantId: string, @Query() query: LeadQueryDto) {
    return this.leadsService.list(tenantId, query);
  }

  @Get('api/v1/load-board/leads/:id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.leadsService.findOne(tenantId, id);
  }

  @Put('api/v1/load-board/leads/:id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/assign')
  assign(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: AssignLeadDto) {
    return this.leadsService.assign(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/contact')
  contact(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ContactLeadDto) {
    return this.leadsService.contact(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/qualify')
  qualify(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: QualifyLeadDto) {
    return this.leadsService.qualify(tenantId, id, dto);
  }

  @Post('api/v1/load-board/leads/:id/convert')
  convert(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: ConvertLeadDto) {
    return this.leadsService.convert(tenantId, id, dto);
  }
}
