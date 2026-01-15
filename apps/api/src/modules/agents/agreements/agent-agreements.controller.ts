import { Body, Controller, Get, HttpCode, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { AgentAgreementsService } from './agent-agreements.service';
import { CreateAgentAgreementDto, UpdateAgentAgreementDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller()
@UseGuards(JwtAuthGuard)
@ApiTags('Agent Agreements')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class AgentAgreementsController {
  constructor(private readonly agreementsService: AgentAgreementsService) {}

  @Get('agents/:id/agreements')
  @ApiOperation({ summary: 'List agreements for agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent agreements list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  listByAgent(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.listByAgent(req.user.tenantId, id);
  }

  @Post('agents/:id/agreements')
  @ApiOperation({ summary: 'Create agent agreement' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent agreement created')
  @ApiErrorResponses()
  create(@Request() req: any, @Param('id') id: string, @Body() dto: CreateAgentAgreementDto) {
    return this.agreementsService.create(req.user.tenantId, id, dto);
  }

  @Get('agent-agreements/:id')
  @ApiOperation({ summary: 'Get agent agreement by ID' })
  @ApiParam({ name: 'id', description: 'Agreement ID' })
  @ApiStandardResponse('Agent agreement details')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.findOne(req.user.tenantId, id);
  }

  @Put('agent-agreements/:id')
  @ApiOperation({ summary: 'Update agent agreement' })
  @ApiParam({ name: 'id', description: 'Agreement ID' })
  @ApiStandardResponse('Agent agreement updated')
  @ApiErrorResponses()
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAgentAgreementDto) {
    return this.agreementsService.update(req.user.tenantId, id, dto);
  }

  @Post('agent-agreements/:id/activate')
  @ApiOperation({ summary: 'Activate agent agreement' })
  @ApiParam({ name: 'id', description: 'Agreement ID' })
  @ApiStandardResponse('Agent agreement activated')
  @ApiErrorResponses()
  @Roles('manager', 'admin')
  @HttpCode(200)
  activate(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.activate(req.user.tenantId, id);
  }

  @Post('agent-agreements/:id/terminate')
  @ApiOperation({ summary: 'Terminate agent agreement' })
  @ApiParam({ name: 'id', description: 'Agreement ID' })
  @ApiStandardResponse('Agent agreement terminated')
  @ApiErrorResponses()
  @Roles('manager', 'admin')
  @HttpCode(200)
  terminate(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.terminate(req.user.tenantId, id);
  }
}
