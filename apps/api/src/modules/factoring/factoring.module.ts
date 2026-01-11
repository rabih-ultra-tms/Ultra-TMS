import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FactoringCompaniesController } from './companies/factoring-companies.controller';
import { FactoringCompaniesService } from './companies/factoring-companies.service';
import { CarrierFactoringStatusController } from './carrier-status/carrier-factoring-status.controller';
import { CarrierFactoringStatusService } from './carrier-status/carrier-factoring-status.service';
import { NoaRecordsController } from './noa/noa-records.controller';
import { NoaRecordsService } from './noa/noa-records.service';
import { FactoringVerificationsController } from './verifications/factoring-verifications.controller';
import { FactoringVerificationsService } from './verifications/factoring-verifications.service';
import { FactoredPaymentsController } from './payments/factored-payments.controller';
import { FactoredPaymentsService } from './payments/factored-payments.service';
import { PaymentRoutingService } from './routing/payment-routing.service';

@Module({
  controllers: [
    FactoringCompaniesController,
    NoaRecordsController,
    CarrierFactoringStatusController,
    FactoringVerificationsController,
    FactoredPaymentsController,
  ],
  providers: [
    PrismaService,
    FactoringCompaniesService,
    NoaRecordsService,
    CarrierFactoringStatusService,
    FactoringVerificationsService,
    FactoredPaymentsService,
    PaymentRoutingService,
  ],
  exports: [
    FactoringCompaniesService,
    NoaRecordsService,
    CarrierFactoringStatusService,
    FactoringVerificationsService,
    FactoredPaymentsService,
    PaymentRoutingService,
  ],
})
export class FactoringModule {}
