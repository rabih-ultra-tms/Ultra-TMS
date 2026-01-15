import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';

class QuickBooksSyncDto {
  syncType?: 'full' | 'incremental';
  entities?: string[];
}

@Controller('quickbooks')
@UseGuards(JwtAuthGuard)
@Roles('ADMIN', 'ACCOUNTING')
@ApiTags('Accounting')
@ApiBearerAuth('JWT-auth')
export class QuickBooksController {
  @Post('sync')
  async triggerSync(
    @Body() dto: QuickBooksSyncDto,
    @CurrentTenant() _tenantId: string,
  ) {
    return {
      status: 'queued',
      message: 'QuickBooks sync queued - integration pending implementation',
      syncType: dto.syncType || 'incremental',
      entities: dto.entities || ['invoices', 'payments', 'customers'],
      queuedAt: new Date().toISOString(),
    };
  }

  @Get('status')
  async getSyncStatus(@CurrentTenant() _tenantId: string) {
    return {
      connected: false,
      lastSync: null,
      message: 'QuickBooks integration not configured',
      configuration: {
        clientId: null,
        realmId: null,
        configured: false,
      },
    };
  }
}
