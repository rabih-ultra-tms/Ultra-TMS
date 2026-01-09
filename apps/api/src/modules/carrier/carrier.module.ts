import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CarriersService } from './carriers.service';
import { DriversService } from './drivers.service';
import { InsurancesService } from './insurances.service';
import { CarriersController } from './carriers.controller';
import { DriversController } from './drivers.controller';
import { InsurancesController } from './insurances.controller';

@Module({
  controllers: [CarriersController, DriversController, InsurancesController],
  providers: [PrismaService, CarriersService, DriversService, InsurancesService],
  exports: [CarriersService, DriversService, InsurancesService],
})
export class CarrierModule {}
