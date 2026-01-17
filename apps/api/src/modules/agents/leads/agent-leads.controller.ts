import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { AgentLeadsService } from './agent-leads.service';
import {
  ConvertLeadDto,
  LeadQueryDto,
  QualifyLeadDto,
  RejectLeadDto,
  SubmitLeadDto,
  UpdateAgentLeadDto,
} from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Agents')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'AGENT_MANAGER', 'AGENT')
export class AgentLeadsController {
  constructor(private readonly leadsService: AgentLeadsService) {}

  @Get('agents/:id/leads')
  @ApiOperation({ summary: 'List leads for agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent leads list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'AGENT')
  listByAgent(@Request() req: any, @Param('id') id: string, @Query() query: LeadQueryDto) {
    return this.leadsService.listByAgent(req.user.tenantId, id, query);
  }

  @Post('agents/:id/leads')
  @ApiOperation({ summary: 'Submit lead for agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent lead submitted')
  @ApiErrorResponses()
  submit(@Request() req: any, @Param('id') id: string, @Body() dto: SubmitLeadDto) {
    return this.leadsService.submit(req.user.tenantId, id, dto);
  }

  @Get('agent-leads')
  @ApiOperation({ summary: 'List all agent leads' })
  @ApiStandardResponse('Agent leads list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'AGENT')
  listAll(@Request() req: any, @Query() query: LeadQueryDto) {
    return this.leadsService.listAll(req.user.tenantId, query);
  }

  @Get('agent-leads/:id')
  @ApiOperation({ summary: 'Get agent lead by ID' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Agent lead details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'AGENT')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.leadsService.findOne(req.user.tenantId, id);
  }

  @Put('agent-leads/:id')
  @ApiOperation({ summary: 'Update agent lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Agent lead updated')
  @ApiErrorResponses()
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAgentLeadDto) {
    return this.leadsService.update(req.user.tenantId, id, dto);
  }

  @Post('agent-leads/:id/qualify')
  @ApiOperation({ summary: 'Qualify agent lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Agent lead qualified')
  @ApiErrorResponses()
  @HttpCode(200)
  qualify(@Request() req: any, @Param('id') id: string, @Body() dto: QualifyLeadDto) {
    return this.leadsService.qualify(req.user.tenantId, req.user.userId, id, dto);
  }

  @Post('agent-leads/:id/convert')
  @ApiOperation({ summary: 'Convert agent lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Agent lead converted')
  @ApiErrorResponses()
  @HttpCode(200)
  convert(@Request() req: any, @Param('id') id: string, @Body() dto: ConvertLeadDto) {
    return this.leadsService.convert(req.user.tenantId, req.user.userId, id, dto);
  }

  @Post('agent-leads/:id/reject')
  @ApiOperation({ summary: 'Reject agent lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiStandardResponse('Agent lead rejected')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER')
  @HttpCode(200)
  reject(@Request() req: any, @Param('id') id: string, @Body() dto: RejectLeadDto) {
    return this.leadsService.reject(req.user.tenantId, id, dto);
  }
}
