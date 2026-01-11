import { Body, Controller, Get, HttpCode, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentAgreementsService } from './agent-agreements.service';
import { CreateAgentAgreementDto, UpdateAgentAgreementDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AgentAgreementsController {
  constructor(private readonly agreementsService: AgentAgreementsService) {}

  @Get('agents/:id/agreements')
  listByAgent(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.listByAgent(req.user.tenantId, id);
  }

  @Post('agents/:id/agreements')
  create(@Request() req: any, @Param('id') id: string, @Body() dto: CreateAgentAgreementDto) {
    return this.agreementsService.create(req.user.tenantId, id, dto);
  }

  @Get('agent-agreements/:id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.findOne(req.user.tenantId, id);
  }

  @Put('agent-agreements/:id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAgentAgreementDto) {
    return this.agreementsService.update(req.user.tenantId, id, dto);
  }

  @Post('agent-agreements/:id/activate')
  @HttpCode(200)
  activate(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.activate(req.user.tenantId, id);
  }

  @Post('agent-agreements/:id/terminate')
  @HttpCode(200)
  terminate(@Request() req: any, @Param('id') id: string) {
    return this.agreementsService.terminate(req.user.tenantId, id);
  }
}
