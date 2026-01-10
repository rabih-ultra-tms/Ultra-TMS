import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CarriersService } from './carriers.service';
import { DriversService } from './drivers.service';
import { InsurancesService } from './insurances.service';
import { ContactsService } from './contacts.service';
import { DocumentsService } from './documents.service';
import { CarriersController } from './carriers.controller';
import { DriversController } from './drivers.controller';
import { DriversGlobalController } from './drivers-global.controller';
import { InsurancesController } from './insurances.controller';
import { ContactsController } from './contacts.controller';
import { DocumentsController } from './documents.controller';

@Module({
  controllers: [
    CarriersController,
    DriversController,
    DriversGlobalController,
    InsurancesController,
    ContactsController,
    DocumentsController,
  ],
  providers: [
    PrismaService,
    CarriersService,
    DriversService,
    InsurancesService,
    ContactsService,
    DocumentsService,
  ],
  exports: [CarriersService, DriversService, InsurancesService, ContactsService, DocumentsService],
})
export class CarrierModule {}
