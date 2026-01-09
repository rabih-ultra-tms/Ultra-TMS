import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CompaniesService } from './companies.service';
import { ContactsService } from './contacts.service';
import { OpportunitiesService } from './opportunities.service';
import { ActivitiesService } from './activities.service';
import { CompaniesController } from './companies.controller';
import { ContactsController } from './contacts.controller';
import { OpportunitiesController } from './opportunities.controller';
import { ActivitiesController } from './activities.controller';

@Module({
  controllers: [
    CompaniesController,
    ContactsController,
    OpportunitiesController,
    ActivitiesController,
  ],
  providers: [
    PrismaService,
    CompaniesService,
    ContactsService,
    OpportunitiesService,
    ActivitiesService,
  ],
  exports: [
    CompaniesService,
    ContactsService,
    OpportunitiesService,
    ActivitiesService,
  ],
})
export class CrmModule {}
