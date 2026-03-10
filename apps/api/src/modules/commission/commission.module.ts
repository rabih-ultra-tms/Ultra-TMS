import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CommissionPlansService,
  CommissionEntriesService,
  CommissionPayoutsService,
  CommissionsDashboardService,
} from './services';
import {
  CommissionPlansController,
  CommissionEntriesController,
  CommissionPayoutsController,
  CommissionsDashboardController,
} from './controllers';
import { CommissionEventsListener } from './listeners/commission-events.listener';

@Module({
  controllers: [
    CommissionPlansController,
    CommissionEntriesController,
    CommissionPayoutsController,
    CommissionsDashboardController,
  ],
  providers: [
    PrismaService,
    CommissionPlansService,
    CommissionEntriesService,
    CommissionPayoutsService,
    CommissionsDashboardService,
    CommissionEventsListener,
  ],
  exports: [
    CommissionPlansService,
    CommissionEntriesService,
    CommissionPayoutsService,
    CommissionsDashboardService,
  ],
})
export class CommissionModule {}
