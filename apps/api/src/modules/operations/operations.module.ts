import { Module } from '@nestjs/common';
import { LoadPlannerQuotesModule } from './load-planner-quotes/load-planner-quotes.module';
import { CarriersModule } from './carriers/carriers.module';
import { LoadHistoryModule } from './load-history/load-history.module';
import { EquipmentModule } from './equipment/equipment.module';
import { TruckTypesController } from './truck-types/truck-types.controller';
import { TruckTypesService } from './truck-types/truck-types.service';
import { PrismaService } from '../../prisma.service';
import { InlandServiceTypesModule } from './inland-service-types/inland-service-types.module';

@Module({
  imports: [
    LoadPlannerQuotesModule,
    CarriersModule,
    LoadHistoryModule,
    EquipmentModule,
    InlandServiceTypesModule,
  ],
  controllers: [TruckTypesController],
  providers: [TruckTypesService, PrismaService],
  exports: [
    LoadPlannerQuotesModule,
    CarriersModule,
    LoadHistoryModule,
    EquipmentModule,
    InlandServiceTypesModule,
    TruckTypesService,
  ],
})
export class OperationsModule {}
