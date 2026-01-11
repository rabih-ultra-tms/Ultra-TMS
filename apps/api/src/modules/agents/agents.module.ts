import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AgentsController } from './agents/agents.controller';
import { AgentsService } from './agents/agents.service';
import { AgentAgreementsController } from './agreements/agent-agreements.controller';
import { AgentAgreementsService } from './agreements/agent-agreements.service';
import { CustomerAssignmentsController } from './assignments/customer-assignments.controller';
import { CustomerAssignmentsService } from './assignments/customer-assignments.service';
import { AgentLeadsController } from './leads/agent-leads.controller';
import { AgentLeadsService } from './leads/agent-leads.service';
import { AgentCommissionsController } from './commissions/agent-commissions.controller';
import { AgentCommissionsService } from './commissions/agent-commissions.service';
import { AgentStatementsController } from './statements/agent-statements.controller';
import { AgentStatementsService } from './statements/agent-statements.service';

@Module({
  imports: [],
  controllers: [
    AgentsController,
    AgentAgreementsController,
    CustomerAssignmentsController,
    AgentLeadsController,
    AgentCommissionsController,
    AgentStatementsController,
  ],
  providers: [
    PrismaService,
    AgentsService,
    AgentAgreementsService,
    CustomerAssignmentsService,
    AgentLeadsService,
    AgentCommissionsService,
    AgentStatementsService,
  ],
})
export class AgentsModule {}
