import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RateLookupController } from './lookup/rate-lookup.controller';
import { RateLookupService } from './lookup/rate-lookup.service';
import { RateAggregatorService } from './lookup/rate-aggregator.service';
import { RateHistoryController } from './history/rate-history.controller';
import { RateHistoryService } from './history/rate-history.service';
import { LaneAnalyticsController } from './lanes/lane-analytics.controller';
import { LaneAnalyticsService } from './lanes/lane-analytics.service';
import { RateAlertsController } from './alerts/rate-alerts.controller';
import { RateAlertsService } from './alerts/rate-alerts.service';
import { AlertEvaluatorService } from './alerts/alert-evaluator.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { ProvidersController } from './providers/providers.controller';
import { ProvidersService } from './providers/providers.service';
import { DatProvider } from './providers/dat.provider';
import { TruckstopProvider } from './providers/truckstop.provider';
import { GreenscreensProvider } from './providers/greenscreens.provider';

@Module({
  controllers: [
    RateLookupController,
    RateHistoryController,
    LaneAnalyticsController,
    RateAlertsController,
    AnalyticsController,
    ProvidersController,
  ],
  providers: [
    PrismaService,
    RateLookupService,
    RateAggregatorService,
    RateHistoryService,
    LaneAnalyticsService,
    RateAlertsService,
    AlertEvaluatorService,
    AnalyticsService,
    ProvidersService,
    DatProvider,
    TruckstopProvider,
    GreenscreensProvider,
  ],
})
export class RateIntelligenceModule {}
