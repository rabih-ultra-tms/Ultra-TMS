import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AgentCommissionsService } from './agent-commissions.service';
import { CommissionQueryDto } from './dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class AgentCommissionsController {
  constructor(private readonly commissionsService: AgentCommissionsService) {}

  @Get('agents/:id/commissions')
  listForAgent(@Request() req: any, @Param('id') id: string, @Query() query: CommissionQueryDto) {
    return this.commissionsService.listForAgent(req.user.tenantId, id, query);
  }

  @Get('agents/:id/performance')
  performance(@Request() req: any, @Param('id') id: string) {
    return this.commissionsService.performance(req.user.tenantId, id);
  }

  @Get('agents/rankings')
  rankings(@Request() req: any) {
    return this.commissionsService.rankings(req.user.tenantId);
  }
}
