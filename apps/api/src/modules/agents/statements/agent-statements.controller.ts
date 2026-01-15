import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AgentStatementsService } from './agent-statements.service';
import { GenerateStatementDto, StatementQueryDto } from './dto';
import type { Response } from 'express';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';
import { PrismaService } from '../../../prisma.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Agent Commissions')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
export class AgentStatementsController {
  constructor(
    private readonly statementsService: AgentStatementsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('agents/:id/statements')
  @ApiOperation({ summary: 'List statements for agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent statements list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
  async listForAgent(@Request() req: any, @Param('id') id: string, @Query() query: StatementQueryDto) {
    await this.ensureAgentSelfAccess(req.user, id);
    return this.statementsService.listForAgent(req.user.tenantId, id, query);
  }

  @Post('agents/:id/statements/generate')
  @ApiOperation({ summary: 'Generate agent statement' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiStandardResponse('Agent statement generated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING')
  generate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: GenerateStatementDto,
  ) {
    return this.statementsService.generate(req.user.tenantId, id, dto);
  }

  @Get('agents/:id/statements/:statementId')
  @ApiOperation({ summary: 'Get agent statement by ID' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiParam({ name: 'statementId', description: 'Statement ID' })
  @ApiStandardResponse('Agent statement details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
  async findOne(@Request() req: any, @Param('id') id: string, @Param('statementId') statementId: string) {
    await this.ensureAgentSelfAccess(req.user, id);
    return this.statementsService.findOne(req.user.tenantId, id, statementId);
  }

  @Get('agents/:id/statements/:statementId/pdf')
  @ApiOperation({ summary: 'Download agent statement PDF' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiParam({ name: 'statementId', description: 'Statement ID' })
  @ApiStandardResponse('Agent statement PDF')
  @ApiErrorResponses()
  @Roles('ADMIN', 'AGENT_MANAGER', 'ACCOUNTING', 'AGENT')
  async download(
    @Request() req: any,
    @Param('id') id: string,
    @Param('statementId') statementId: string,
    @Res() res: Response,
  ) {
    await this.ensureAgentSelfAccess(req.user, id);
    const pdfBuffer = await this.statementsService.generatePdf(req.user.tenantId, id, statementId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=agent-statement-${statementId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    return res.send(pdfBuffer);
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
      throw new ForbiddenException('Cannot access other agent statements');
    }
  }
}
