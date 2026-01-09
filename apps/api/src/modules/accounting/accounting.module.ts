import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// Controllers
import {
  ChartOfAccountsController,
  InvoicesController,
  SettlementsController,
  PaymentsReceivedController,
  PaymentsMadeController,
  JournalEntriesController,
} from './controllers';

// Services
import {
  ChartOfAccountsService,
  InvoicesService,
  SettlementsService,
  PaymentsReceivedService,
  PaymentsMadeService,
  JournalEntriesService,
} from './services';

@Module({
  controllers: [
    ChartOfAccountsController,
    InvoicesController,
    SettlementsController,
    PaymentsReceivedController,
    PaymentsMadeController,
    JournalEntriesController,
  ],
  providers: [
    PrismaService,
    ChartOfAccountsService,
    InvoicesService,
    SettlementsService,
    PaymentsReceivedService,
    PaymentsMadeService,
    JournalEntriesService,
  ],
  exports: [
    ChartOfAccountsService,
    InvoicesService,
    SettlementsService,
    PaymentsReceivedService,
    PaymentsMadeService,
    JournalEntriesService,
  ],
})
export class AccountingModule {}
