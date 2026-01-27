import { Module } from '@nestjs/common';
import { LoadPlannerQuotesModule } from './load-planner-quotes/load-planner-quotes.module';
import { CarriersModule } from './carriers/carriers.module';
import { LoadHistoryModule } from './load-history/load-history.module';
import { TruckTypesController } from './truck-types/truck-types.controller';
import { TruckTypesService } from './truck-types/truck-types.service';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    LoadPlannerQuotesModule,
    CarriersModule,
    LoadHistoryModule,
  ],
  controllers: [TruckTypesController],
  providers: [TruckTypesService, PrismaService],
  exports: [
    LoadPlannerQuotesModule,
    CarriersModule,
    LoadHistoryModule,
    TruckTypesService,
  ],
})
export class OperationsModule {}
