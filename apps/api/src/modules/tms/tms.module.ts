import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { OrdersService } from './orders.service';
import { LoadsService } from './loads.service';
import { StopsService } from './stops.service';
import { OrdersController } from './orders.controller';
import { LoadsController } from './loads.controller';
import { StopsController } from './stops.controller';
import { TrackingController } from './tracking.controller';
import { PublicTrackingController } from './public-tracking.controller';
import { TrackingService } from './tracking.service';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Module({
  imports: [EventEmitterModule, ConfigModule, JwtModule.register({})],
  controllers: [OrdersController, LoadsController, StopsController, TrackingController, PublicTrackingController],
  providers: [PrismaService, OrdersService, LoadsService, StopsService, TrackingService, NotificationsGateway],
  exports: [OrdersService, LoadsService, StopsService, TrackingService, NotificationsGateway],
})
export class TmsModule {}
