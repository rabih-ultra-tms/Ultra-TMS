import { Module } from '@nestjs/common';
import { LoadPlannerQuotesModule } from './load-planner-quotes/load-planner-quotes.module';
import { CarriersModule } from './carriers/carriers.module';
import { LoadHistoryModule } from './load-history/load-history.module';
import { EquipmentModule } from './equipment/equipment.module';
import { TruckTypesController } from './truck-types/truck-types.controller';
import { TruckTypesService } from './truck-types/truck-types.service';
import { PrismaService } from '../../prisma.service';
import { InlandServiceTypesModule } from './inland-service-types/inland-service-types.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    LoadPlannerQuotesModule,
    CarriersModule,
    LoadHistoryModule,
    EquipmentModule,
    InlandServiceTypesModule,
    DashboardModule,
  ],
  controllers: [TruckTypesController],
  providers: [TruckTypesService, PrismaService],
  exports: [
    LoadPlannerQuotesModule,
    CarriersModule,
    LoadHistoryModule,
    EquipmentModule,
    InlandServiceTypesModule,
    DashboardModule,
    TruckTypesService,
  ],
})
export class OperationsModule {}
