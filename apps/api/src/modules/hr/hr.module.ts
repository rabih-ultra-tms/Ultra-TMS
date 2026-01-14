import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma.service';
import { EmployeesController } from './employees/employees.controller';
import { EmployeesService } from './employees/employees.service';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { PositionsController } from './positions/positions.controller';
import { PositionsService } from './positions/positions.service';
import { LocationsController } from './locations/locations.controller';
import { LocationsService } from './locations/locations.service';
import { TimeOffController } from './time-off/time-off.controller';
import { TimeOffService } from './time-off/time-off.service';
import { TimeOffBalanceService } from './time-off/balance.service';
import { TimeEntriesController } from './time-tracking/time-entries.controller';
import { TimeEntriesService } from './time-tracking/time-entries.service';

@Module({
  imports: [EventEmitterModule],
  controllers: [
    EmployeesController,
    DepartmentsController,
    PositionsController,
    LocationsController,
    TimeOffController,
    TimeEntriesController,
  ],
  providers: [
    PrismaService,
    EmployeesService,
    DepartmentsService,
    PositionsService,
    LocationsService,
    TimeOffService,
    TimeOffBalanceService,
    TimeEntriesService,
  ],
})
export class HrModule {}