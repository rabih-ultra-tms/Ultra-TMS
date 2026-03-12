import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Headers,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { JwtAuthGuard } from '../auth/guards';
import { HubspotService } from './hubspot.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';
import { HubspotWebhookGuard } from './guards/hubspot-webhook.guard';

@Controller('crm/hubspot')
@ApiTags('CRM')
export class HubspotController {
  private readonly logger = new Logger(HubspotController.name);
  private readonly clientSecret: string;

  constructor(
    private readonly hubspotService: HubspotService,
    private readonly configService: ConfigService,
  ) {
    this.clientSecret = this.configService.get<string>('HUBSPOT_CLIENT_SECRET') || '';
  }

  // Webhook endpoint - no JWT auth; secured via HubSpot signature verification (SEC-006)
  @Post('webhook')
  @UseGuards(HubspotWebhookGuard)
  @ApiOperation({ summary: 'Handle HubSpot webhook' })
  @ApiStandardResponse('Webhook processed')
  @ApiErrorResponses()
  async handleWebhook(
    @Headers('x-hubspot-signature') signature: string,
    @Body() payload: Record<string, unknown>,
  ) {
    // Validate HubSpot v1 signature: SHA-256(clientSecret + requestBody)
    if (this.clientSecret) {
      if (!signature) {
        throw new ForbiddenException('Missing HubSpot signature');
      }
      const sourceString = this.clientSecret + JSON.stringify(payload);
      const computed = createHash('sha256').update(sourceString).digest('hex');
      if (computed !== signature) {
        this.logger.warn('Invalid HubSpot webhook signature');
        throw new ForbiddenException('Invalid webhook signature');
      }
    } else {
      this.logger.warn('HUBSPOT_CLIENT_SECRET not configured — skipping signature validation');
    }

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
    @Body() dto?: { companyIds?: string[] },
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
    @Body() dto?: { contactIds?: string[] },
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
    @Body() dto?: { opportunityIds?: string[] },
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
    @Query('limit') limit?: number,
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
    @Body() dto: { mapping: Record<string, string> },
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
