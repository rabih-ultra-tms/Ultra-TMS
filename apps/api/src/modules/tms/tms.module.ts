import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { OrdersService } from './orders.service';
import { LoadsService } from './loads.service';
import { StopsService } from './stops.service';
import { OrdersController } from './orders.controller';
import { LoadsController } from './loads.controller';
import { StopsController } from './stops.controller';

@Module({
  imports: [EventEmitterModule],
  controllers: [OrdersController, LoadsController, StopsController],
  providers: [PrismaService, OrdersService, LoadsService, StopsService],
  exports: [OrdersService, LoadsService, StopsService],
})
export class TmsModule {}
