import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { QuotesService } from './quotes.service';
import { RateContractsService } from './rate-contracts.service';
import { AccessorialRatesService } from './accessorial-rates.service';
import { SalesPerformanceService } from './sales-performance.service';
import { RateCalculationService } from './rate-calculation.service';
import { QuotesController } from './quotes.controller';
import { RateContractsController } from './rate-contracts.controller';
import { AccessorialRatesController } from './accessorial-rates.controller';
import { SalesPerformanceController } from './sales-performance.controller';

@Module({
  imports: [EventEmitterModule],
  controllers: [
    QuotesController,
    RateContractsController,
    AccessorialRatesController,
    SalesPerformanceController,
  ],
  providers: [
    PrismaService,
    QuotesService,
    RateContractsService,
    AccessorialRatesService,
    SalesPerformanceService,
    RateCalculationService,
  ],
  exports: [
    QuotesService,
    RateContractsService,
    AccessorialRatesService,
    SalesPerformanceService,
    RateCalculationService,
  ],
})
export class SalesModule {}
