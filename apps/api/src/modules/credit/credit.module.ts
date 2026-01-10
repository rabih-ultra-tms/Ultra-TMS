import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreditApplicationsController } from './applications/credit-applications.controller';
import { CreditApplicationsService } from './applications/credit-applications.service';
import { CreditLimitsController } from './limits/credit-limits.controller';
import { CreditLimitsService } from './limits/credit-limits.service';
import { CreditHoldsController } from './holds/credit-holds.controller';
import { CreditHoldsService } from './holds/credit-holds.service';
import { CollectionsController } from './collections/collections.controller';
import { CollectionsService } from './collections/collections.service';
import { PaymentPlansController } from './payment-plans/payment-plans.controller';
import { PaymentPlansService } from './payment-plans/payment-plans.service';

@Module({
  controllers: [
    CreditApplicationsController,
    CreditLimitsController,
    CreditHoldsController,
    CollectionsController,
    PaymentPlansController,
  ],
  providers: [
    PrismaService,
    CreditApplicationsService,
    CreditLimitsService,
    CreditHoldsService,
    CollectionsService,
    PaymentPlansService,
  ],
  exports: [
    CreditApplicationsService,
    CreditLimitsService,
    CreditHoldsService,
    CollectionsService,
    PaymentPlansService,
  ],
})
export class CreditModule {}
