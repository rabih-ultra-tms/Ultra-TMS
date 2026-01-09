import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// Services
import { KpisService } from './kpis.service';
import { DashboardsService } from './dashboards.service';
import { ReportsService } from './reports.service';
import { AlertsService, SavedViewsService, DataQueryService } from './alerts.service';

// Controllers
import { KpisController } from './kpis.controller';
import { DashboardsController } from './dashboards.controller';
import { ReportsController } from './reports.controller';
import { AlertsController, SavedViewsController, DataQueryController } from './alerts.controller';

@Module({
  controllers: [
    KpisController,
    DashboardsController,
    ReportsController,
    AlertsController,
    SavedViewsController,
    DataQueryController,
  ],
  providers: [
    PrismaService,
    KpisService,
    DashboardsService,
    ReportsService,
    AlertsService,
    SavedViewsService,
    DataQueryService,
  ],
  exports: [
    KpisService,
    DashboardsService,
    ReportsService,
    AlertsService,
    SavedViewsService,
    DataQueryService,
  ],
})
export class AnalyticsModule {}
