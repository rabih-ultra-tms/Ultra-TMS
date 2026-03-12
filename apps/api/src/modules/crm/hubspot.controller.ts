import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { HubspotService } from './hubspot.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { HubspotWebhookGuard } from './guards/hubspot-webhook.guard';
import { Public } from '../../common/decorators';

@Controller('crm/hubspot')
@ApiTags('CRM')
export class HubspotController {
  constructor(private readonly hubspotService: HubspotService) {}

  // Webhook endpoint - public but secured via HubSpot signature verification (SEC-026)
  @Post('webhook')
  @Public()
  @UseGuards(HubspotWebhookGuard)
  @ApiOperation({ summary: 'Handle HubSpot webhook' })
  @ApiStandardResponse('Webhook processed')
  @ApiErrorResponses()
  async handleWebhook(@Body() payload: Record<string, unknown>) {
    const tenantId = (payload.portalId as string) || 'default';
    return this.hubspotService.handleWebhook(tenantId, payload);
  }

  @Post('sync/companies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync companies from HubSpot' })
  @ApiStandardResponse('Company sync started')
  @ApiErrorResponses()
  async syncCompanies(
    @CurrentTenant() tenantId: string,
    @Body() dto?: { companyIds?: string[] }
  ) {
    return this.hubspotService.bulkSyncCompanies(tenantId, dto?.companyIds);
  }

  @Post('sync/contacts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync contacts from HubSpot' })
  @ApiStandardResponse('Contact sync started')
  @ApiErrorResponses()
  async syncContacts(
    @CurrentTenant() tenantId: string,
    @Body() dto?: { contactIds?: string[] }
  ) {
    return this.hubspotService.bulkSyncContacts(tenantId, dto?.contactIds);
  }

  @Post('sync/deals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync deals from HubSpot' })
  @ApiStandardResponse('Deal sync started')
  @ApiErrorResponses()
  async syncDeals(
    @CurrentTenant() tenantId: string,
    @Body() dto?: { opportunityIds?: string[] }
  ) {
    return this.hubspotService.bulkSyncDeals(tenantId, dto?.opportunityIds);
  }

  @Get('sync/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get HubSpot sync status' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponse('Sync status')
  @ApiErrorResponses()
  async getSyncStatus(
    @CurrentTenant() tenantId: string,
    @Query('limit') limit?: number
  ) {
    return this.hubspotService.getSyncStatus(tenantId, { limit });
  }

  @Post('field-mapping')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Configure HubSpot field mapping' })
  @ApiStandardResponse('Field mapping updated')
  @ApiErrorResponses()
  async configureFieldMapping(
    @CurrentTenant() tenantId: string,
    @Body() dto: { mapping: Record<string, string> }
  ) {
    return this.hubspotService.configureFieldMapping(tenantId, dto.mapping);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get HubSpot connection status' })
  @ApiStandardResponse('HubSpot connection status')
  @ApiErrorResponses()
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
