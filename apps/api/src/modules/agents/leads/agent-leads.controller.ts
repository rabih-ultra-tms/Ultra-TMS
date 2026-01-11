import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentLeadsService } from './agent-leads.service';
import {
  ConvertLeadDto,
  LeadQueryDto,
  QualifyLeadDto,
  RejectLeadDto,
  SubmitLeadDto,
  UpdateAgentLeadDto,
} from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AgentLeadsController {
  constructor(private readonly leadsService: AgentLeadsService) {}

  @Get('agents/:id/leads')
  listByAgent(@Request() req: any, @Param('id') id: string, @Query() query: LeadQueryDto) {
    return this.leadsService.listByAgent(req.user.tenantId, id, query);
  }

  @Post('agents/:id/leads')
  submit(@Request() req: any, @Param('id') id: string, @Body() dto: SubmitLeadDto) {
    return this.leadsService.submit(req.user.tenantId, id, dto);
  }

  @Get('agent-leads')
  listAll(@Request() req: any, @Query() query: LeadQueryDto) {
    return this.leadsService.listAll(req.user.tenantId, query);
  }

  @Get('agent-leads/:id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.leadsService.findOne(req.user.tenantId, id);
  }

  @Put('agent-leads/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAgentLeadDto) {
    return this.leadsService.update(req.user.tenantId, id, dto);
  }

  @Post('agent-leads/:id/qualify')
  @HttpCode(200)
  qualify(@Request() req: any, @Param('id') id: string, @Body() dto: QualifyLeadDto) {
    return this.leadsService.qualify(req.user.tenantId, req.user.userId, id, dto);
  }

  @Post('agent-leads/:id/convert')
  @HttpCode(200)
  convert(@Request() req: any, @Param('id') id: string, @Body() dto: ConvertLeadDto) {
    return this.leadsService.convert(req.user.tenantId, req.user.userId, id, dto);
  }

  @Post('agent-leads/:id/reject')
  @HttpCode(200)
  reject(@Request() req: any, @Param('id') id: string, @Body() dto: RejectLeadDto) {
    return this.leadsService.reject(req.user.tenantId, id, dto);
  }
}
