import { Controller, ForbiddenException, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AgentCommissionsService } from './agent-commissions.service';
import { CommissionQueryDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { PrismaService } from '../../../prisma.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Agent Commissions')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
export class AgentCommissionsController {
  constructor(
    private readonly commissionsService: AgentCommissionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('agents/:id/commissions')
  @ApiOperation({ summary: 'List commissions for agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent commissions list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
  async listForAgent(@Request() req: any, @Param('id') id: string, @Query() query: CommissionQueryDto) {
    await this.ensureAgentSelfAccess(req.user, id);
    return this.commissionsService.listForAgent(req.user.tenantId, id, query);
  }

  @Get('agents/:id/performance')
  @ApiOperation({ summary: 'Get agent commission performance' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent performance')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
  async performance(@Request() req: any, @Param('id') id: string) {
    await this.ensureAgentSelfAccess(req.user, id);
    return this.commissionsService.performance(req.user.tenantId, id);
  }

  @Get('agents/rankings')
  @ApiOperation({ summary: 'Get agent commission rankings' })
  @ApiStandardResponse('Agent commission rankings')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'SALES_MANAGER')
  rankings(@Request() req: any) {
    return this.commissionsService.rankings(req.user.tenantId);
  }

  private async ensureAgentSelfAccess(user: any, agentId: string) {
    const roleName = user?.role?.name ?? user?.roleName ?? user?.role;
    if (roleName !== 'AGENT') {
      return;
    }

    const portalUser = await this.prisma.agentPortalUser.findFirst({
      where: { tenantId: user.tenantId, userId: user.id },
      select: { agentId: true },
    });

    if (!portalUser || portalUser.agentId !== agentId) {
      throw new ForbiddenException('Cannot access other agent commissions');
    }
  }
}
