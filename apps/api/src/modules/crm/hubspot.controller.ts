import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { HubspotService } from './hubspot.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';

@Controller('hubspot')
export class HubspotController {
  constructor(private readonly hubspotService: HubspotService) {}

  // Webhook endpoint - no auth (uses HubSpot signature verification)
  @Post('webhook')
  async handleWebhook(
    @Headers('x-hubspot-signature') _signature: string,
    @Body() payload: Record<string, unknown>,
  ) {
    // TODO: Verify HubSpot signature using _signature
    void _signature; // Will be used for signature verification
    // For now, extract tenantId from payload or use default
    const tenantId = (payload.portalId as string) || 'default';
    return this.hubspotService.handleWebhook(tenantId, payload);
  }

  @Post('sync/companies')
  @UseGuards(JwtAuthGuard)
  async syncCompanies(
    @CurrentTenant() tenantId: string,
    @Body() dto?: { companyIds?: string[] },
  ) {
    return this.hubspotService.bulkSyncCompanies(tenantId, dto?.companyIds);
  }

  @Post('sync/contacts')
  @UseGuards(JwtAuthGuard)
  async syncContacts(
    @CurrentTenant() tenantId: string,
    @Body() dto?: { contactIds?: string[] },
  ) {
    return this.hubspotService.bulkSyncContacts(tenantId, dto?.contactIds);
  }

  @Post('sync/deals')
  @UseGuards(JwtAuthGuard)
  async syncDeals(
    @CurrentTenant() tenantId: string,
    @Body() dto?: { opportunityIds?: string[] },
  ) {
    return this.hubspotService.bulkSyncDeals(tenantId, dto?.opportunityIds);
  }

  @Get('sync/status')
  @UseGuards(JwtAuthGuard)
  async getSyncStatus(
    @CurrentTenant() tenantId: string,
    @Query('limit') limit?: number,
  ) {
    return this.hubspotService.getSyncStatus(tenantId, { limit });
  }

  @Post('field-mapping')
  @UseGuards(JwtAuthGuard)
  async configureFieldMapping(
    @CurrentTenant() tenantId: string,
    @Body() dto: { mapping: Record<string, string> },
  ) {
    return this.hubspotService.configureFieldMapping(tenantId, dto.mapping);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getConnectionStatus(@CurrentTenant() tenantId: string) {
    const isConfigured = await this.hubspotService.isConfigured(tenantId);
    return {
      connected: isConfigured,
      message: isConfigured
        ? 'HubSpot integration is active'
        : 'HubSpot integration is not configured. Please add your API key in settings.',
    };
  }
}
