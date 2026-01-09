import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CompaniesService } from './companies.service';
import { ContactsService } from './contacts.service';
import { OpportunitiesService } from './opportunities.service';
import { ActivitiesService } from './activities.service';
import { HubspotService } from './hubspot.service';
import { CompaniesController } from './companies.controller';
import { ContactsController } from './contacts.controller';
import { OpportunitiesController } from './opportunities.controller';
import { ActivitiesController } from './activities.controller';
import { HubspotController } from './hubspot.controller';

@Module({
  controllers: [
    CompaniesController,
    ContactsController,
    OpportunitiesController,
    ActivitiesController,
    HubspotController,
  ],
  providers: [
    PrismaService,
    CompaniesService,
    ContactsService,
    OpportunitiesService,
    ActivitiesService,
    HubspotService,
  ],
  exports: [
    CompaniesService,
    ContactsService,
    OpportunitiesService,
    ActivitiesService,
    HubspotService,
  ],
})
export class CrmModule {}
