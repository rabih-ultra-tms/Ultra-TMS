import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { CarrierPortalAuthGuard } from './guards/carrier-portal-auth.guard';
import { CarrierPortalAuthController } from './auth/carrier-portal-auth.controller';
import { CarrierPortalAuthService } from './auth/carrier-portal-auth.service';
import { CarrierPortalDashboardController } from './dashboard/carrier-portal-dashboard.controller';
import { CarrierPortalDashboardService } from './dashboard/carrier-portal-dashboard.service';
import { CarrierPortalLoadsController } from './loads/carrier-portal-loads.controller';
import { CarrierPortalLoadsService } from './loads/carrier-portal-loads.service';
import { CarrierPortalDocumentsController } from './documents/carrier-portal-documents.controller';
import { CarrierPortalDocumentsService } from './documents/carrier-portal-documents.service';
import { CarrierPortalInvoicesController } from './invoices/carrier-portal-invoices.controller';
import { CarrierPortalInvoicesService } from './invoices/carrier-portal-invoices.service';
import { CarrierPortalComplianceController } from './compliance/carrier-portal-compliance.controller';
import { CarrierPortalComplianceService } from './compliance/carrier-portal-compliance.service';
import { CarrierPortalUsersController } from './users/carrier-portal-users.controller';
import { CarrierPortalUsersService } from './users/carrier-portal-users.service';

@Module({
  imports: [
    // align type expectations for expiresIn across string/number
    JwtModule.register({
      secret: process.env.CARRIER_PORTAL_JWT_SECRET || process.env.JWT_SECRET || 'carrier-portal-secret',
      signOptions: {
        expiresIn: (process.env.CARRIER_PORTAL_JWT_EXPIRES_IN || '2h') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [
    CarrierPortalAuthController,
    CarrierPortalDashboardController,
    CarrierPortalLoadsController,
    CarrierPortalDocumentsController,
    CarrierPortalInvoicesController,
    CarrierPortalComplianceController,
    CarrierPortalUsersController,
  ],
  providers: [
    PrismaService,
    CarrierPortalAuthGuard,
    CarrierPortalAuthService,
    CarrierPortalDashboardService,
    CarrierPortalLoadsService,
    CarrierPortalDocumentsService,
    CarrierPortalInvoicesService,
    CarrierPortalComplianceService,
    CarrierPortalUsersService,
  ],
  exports: [CarrierPortalAuthGuard, CarrierPortalAuthService],
})
export class CarrierPortalModule {}