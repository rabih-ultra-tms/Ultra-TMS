import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { TicketNumberService } from './tickets/ticket-number.service';
import { TeamsController } from './teams/teams.controller';
import { TeamsService } from './teams/teams.service';
import { AssignmentService } from './teams/assignment.service';
import { SlaPoliciesController } from './sla/sla-policies.controller';
import { SlaService } from './sla/sla.service';
import { SlaTrackerService } from './sla/sla-tracker.service';
import { CannedResponsesController } from './canned-responses/canned-responses.controller';
import { CannedResponsesService } from './canned-responses/canned-responses.service';
import { KbController } from './knowledge-base/kb.controller';
import { CategoriesService } from './knowledge-base/categories.service';
import { ArticlesService } from './knowledge-base/articles.service';
import { EscalationService } from './escalation/escalation.service';

@Module({
  imports: [EventEmitterModule],
  controllers: [
    TicketsController,
    TeamsController,
    SlaPoliciesController,
    CannedResponsesController,
    KbController,
  ],
  providers: [
    PrismaService,
    TicketNumberService,
    TicketsService,
    TeamsService,
    AssignmentService,
    SlaService,
    SlaTrackerService,
    CannedResponsesService,
    CategoriesService,
    ArticlesService,
    EscalationService,
  ],
})
export class HelpDeskModule {}
