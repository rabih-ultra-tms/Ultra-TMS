import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// Controllers
import {
  AccountingController,
  ChartOfAccountsController,
  InvoicesController,
  SettlementsController,
  PaymentsReceivedController,
  PaymentsMadeController,
  PaymentsController,
  JournalEntriesController,
  ReportsController,
  QuickBooksController,
} from './controllers';

// Services
import {
  ChartOfAccountsService,
  InvoicesService,
  SettlementsService,
  PaymentsReceivedService,
  PaymentsMadeService,
  JournalEntriesService,
  ReportsService,
  PdfService,
} from './services';

@Module({
  controllers: [
    AccountingController,
    ChartOfAccountsController,
    InvoicesController,
    SettlementsController,
    PaymentsReceivedController,
    PaymentsMadeController,
    PaymentsController,
    JournalEntriesController,
    ReportsController,
    QuickBooksController,
  ],
  providers: [
    PrismaService,
    ChartOfAccountsService,
    InvoicesService,
    SettlementsService,
    PaymentsReceivedService,
    PaymentsMadeService,
    JournalEntriesService,
    ReportsService,
    PdfService,
  ],
  exports: [
    ChartOfAccountsService,
    InvoicesService,
    SettlementsService,
    PaymentsReceivedService,
    PaymentsMadeService,
    JournalEntriesService,
    ReportsService,
    PdfService,
  ],
})
export class AccountingModule {}
