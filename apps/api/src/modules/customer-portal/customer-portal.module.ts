import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CompanyScopeGuard } from './guards/company-scope.guard';
import { PrismaService } from '../../prisma.service';
import { PortalAuthController } from './auth/portal-auth.controller';
import { PortalAuthService } from './auth/portal-auth.service';
import { PortalDashboardController } from './dashboard/portal-dashboard.controller';
import { PortalDashboardService } from './dashboard/portal-dashboard.service';
import { PortalQuotesController } from './quotes/portal-quotes.controller';
import { PortalQuotesService } from './quotes/portal-quotes.service';
import { PortalShipmentsController } from './shipments/portal-shipments.controller';
import { PortalShipmentsService } from './shipments/portal-shipments.service';
import { PortalInvoicesController } from './invoices/portal-invoices.controller';
import { PortalInvoicesService } from './invoices/portal-invoices.service';
import { PortalPaymentsController } from './payments/portal-payments.controller';
import { PortalPaymentsService } from './payments/portal-payments.service';
import { PortalUsersController } from './users/portal-users.controller';
import { PortalUsersService } from './users/portal-users.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'portal-secret',
      signOptions: {
        expiresIn: (process.env.PORTAL_JWT_EXPIRES_IN || '1h') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [
    PortalAuthController,
    PortalDashboardController,
    PortalQuotesController,
    PortalShipmentsController,
    PortalInvoicesController,
    PortalPaymentsController,
    PortalUsersController,
  ],
  providers: [
    PrismaService,
    PortalAuthGuard,
    CompanyScopeGuard,
    PortalAuthService,
    PortalDashboardService,
    PortalQuotesService,
    PortalShipmentsService,
    PortalInvoicesService,
    PortalPaymentsService,
    PortalUsersService,
  ],
  exports: [PortalAuthGuard, PortalAuthService],
})
export class CustomerPortalModule {}