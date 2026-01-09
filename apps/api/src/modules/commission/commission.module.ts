import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CommissionPlansService,
  CommissionEntriesService,
  CommissionPayoutsService,
} from './services';
import {
  CommissionPlansController,
  CommissionEntriesController,
  CommissionPayoutsController,
} from './controllers';

@Module({
  controllers: [
    CommissionPlansController,
    CommissionEntriesController,
    CommissionPayoutsController,
  ],
  providers: [
    PrismaService,
    CommissionPlansService,
    CommissionEntriesService,
    CommissionPayoutsService,
  ],
  exports: [
    CommissionPlansService,
    CommissionEntriesService,
    CommissionPayoutsService,
  ],
})
export class CommissionModule {}
