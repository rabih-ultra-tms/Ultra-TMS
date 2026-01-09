import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { OrdersService } from './orders.service';
import { LoadsService } from './loads.service';
import { StopsService } from './stops.service';
import { OrdersController } from './orders.controller';
import { LoadsController } from './loads.controller';
import { StopsController } from './stops.controller';

@Module({
  controllers: [OrdersController, LoadsController, StopsController],
  providers: [PrismaService, OrdersService, LoadsService, StopsService],
  exports: [OrdersService, LoadsService, StopsService],
})
export class TmsModule {}
