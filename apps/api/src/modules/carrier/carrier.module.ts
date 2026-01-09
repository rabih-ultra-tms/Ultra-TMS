import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CarriersService } from './carriers.service';
import { ContactsService } from './contacts.service';
import { DriversService } from './drivers.service';
import { InsuranceService } from './insurance.service';
import { DocumentsService } from './documents.service';
import { CarriersController } from './carriers.controller';
import { ContactsController } from './contacts.controller';
import { DriversController, CarrierDriversController } from './drivers.controller';
import { InsuranceController, CarrierInsuranceController } from './insurance.controller';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [],
  controllers: [
    CarriersController,
    ContactsController,
    DriversController,
    CarrierDriversController,
    InsuranceController,
    CarrierInsuranceController,
    DocumentsController,
  ],
  providers: [
    PrismaService,
    CarriersService,
    ContactsService,
    DriversService,
    InsuranceService,
    DocumentsService,
  ],
  exports: [
    CarriersService,
    ContactsService,
    DriversService,
    InsuranceService,
    DocumentsService,
  ],
})
export class CarrierModule {}
