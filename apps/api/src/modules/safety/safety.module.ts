import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsService } from './alerts/alerts.service';
import { CsaController } from './csa/csa.controller';
import { CsaService } from './csa/csa.service';
import { DqfController } from './dqf/dqf.controller';
import { DqfService } from './dqf/dqf.service';
import { FmcsaController } from './fmcsa/fmcsa.controller';
import { FmcsaApiClient } from './fmcsa/fmcsa-api.client';
import { FmcsaService } from './fmcsa/fmcsa.service';
import { IncidentsController } from './incidents/incidents.controller';
import { IncidentsService } from './incidents/incidents.service';
import { InsuranceController } from './insurance/insurance.controller';
import { InsuranceService } from './insurance/insurance.service';
import { SafetyReportsController } from './reports/safety-reports.controller';
import { SafetyReportsService } from './reports/safety-reports.service';
import { SafetyScoresController } from './scores/safety-scores.controller';
import { SafetyScoresService } from './scores/safety-scores.service';
import { WatchlistController } from './watchlist/watchlist.controller';
import { WatchlistService } from './watchlist/watchlist.service';

@Module({
  controllers: [
    FmcsaController,
    CsaController,
    InsuranceController,
    DqfController,
    IncidentsController,
    SafetyScoresController,
    WatchlistController,
    AlertsController,
    SafetyReportsController,
  ],
  providers: [
    PrismaService,
    FmcsaApiClient,
    FmcsaService,
    CsaService,
    InsuranceService,
    DqfService,
    IncidentsService,
    SafetyScoresService,
    WatchlistService,
    AlertsService,
    SafetyReportsService,
  ],
  exports: [
    FmcsaService,
    CsaService,
    InsuranceService,
    DqfService,
    IncidentsService,
    SafetyScoresService,
    WatchlistService,
    AlertsService,
    SafetyReportsService,
  ],
})
export class SafetyModule {}
