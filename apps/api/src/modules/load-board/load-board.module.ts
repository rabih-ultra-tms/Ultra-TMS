import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { PostingController } from './posting/posting.controller';
import { PostingService } from './posting/posting.service';
import { CapacityController } from './capacity/capacity.controller';
import { CapacityService } from './capacity/capacity.service';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { RulesController } from './rules/rules.controller';
import { RulesService } from './rules/rules.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { LoadPostingsController } from './controllers';
import { LoadPostingsService } from './services';
import { GeocodingService } from './services/geocoding.service';

@Module({
  controllers: [
    AccountsController,
    LoadPostingsController,
    PostingController,
    CapacityController,
    LeadsController,
    RulesController,
    AnalyticsController,
  ],
  providers: [
    PrismaService,
    AccountsService,
    LoadPostingsService,
    PostingService,
    CapacityService,
    LeadsService,
    RulesService,
    AnalyticsService,
    GeocodingService,
  ],
  exports: [PostingService, AccountsService, CapacityService, LeadsService, RulesService, LoadPostingsService],
})
export class LoadBoardModule {}
