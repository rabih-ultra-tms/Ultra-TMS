import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { KpisController } from './kpis.controller';
import { DashboardsController } from './dashboards.controller';
import { ReportsController } from './reports.controller';
import { AlertsController, DataQueryController, SavedViewsController } from './alerts.controller';
import { KpisService } from './kpis.service';
import { DashboardsService } from './dashboards.service';
import { ReportsService } from './reports.service';
import { AlertsService, DataQueryService, SavedViewsService } from './alerts.service';

@Module({
  controllers: [KpisController, DashboardsController, ReportsController, AlertsController, SavedViewsController, DataQueryController],
  providers: [PrismaService, KpisService, DashboardsService, ReportsService, AlertsService, SavedViewsService, DataQueryService],
})
export class AnalyticsModule {}
