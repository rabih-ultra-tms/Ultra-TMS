import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { OrdersService } from './orders.service';
import { LoadsService } from './loads.service';
import { StopsService } from './stops.service';
import { OrdersController } from './orders.controller';
import { LoadsController } from './loads.controller';
import { StopsController } from './stops.controller';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

@Module({
  imports: [EventEmitterModule],
  controllers: [OrdersController, LoadsController, StopsController, TrackingController],
  providers: [PrismaService, OrdersService, LoadsService, StopsService, TrackingService],
  exports: [OrdersService, LoadsService, StopsService, TrackingService],
})
export class TmsModule {}
