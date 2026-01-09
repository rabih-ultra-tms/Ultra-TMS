import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

interface HubspotSyncResult {
  success: boolean;
  hubspotId?: string;
  error?: string;
}

@Injectable()
export class HubspotService {
  private readonly logger = new Logger(HubspotService.name);

  constructor(private prisma: PrismaService) {}

  // Check if HubSpot is configured for tenant
  async isConfigured(_tenantId: string): Promise<boolean> {
    void _tenantId; // Will be used when tenant settings are implemented
    // In future, check tenant settings for HubSpot API key
    // For now, return false to indicate HubSpot is not yet configured
    return false;
  }

  // Sync company to HubSpot
  async syncCompany(tenantId: string, companyId: string): Promise<HubspotSyncResult> {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId },
    });

    if (!company) {
      return { success: false, error: 'Company not found' };
    }

    // Stub: Log sync attempt
    this.logger.log(`[STUB] Would sync company ${company.name} to HubSpot`);

    await this.prisma.hubspotSyncLog.create({
      data: {
        tenantId,
        entityType: 'COMPANY',
        entityId: companyId,
        hubspotId: company.hubspotId || 'pending',
        syncDirection: 'TO_HUBSPOT',
        syncStatus: 'PENDING',
        payloadSent: {
          name: company.name,
          domain: company.website,
          phone: company.phone,
          industry: company.industry,
        },
      },
    });

    return { success: true, hubspotId: company.hubspotId || undefined };
  }

  // Sync contact to HubSpot
  async syncContact(tenantId: string, contactId: string): Promise<HubspotSyncResult> {
    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, tenantId },
    });

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    this.logger.log(`[STUB] Would sync contact ${contact.firstName} ${contact.lastName} to HubSpot`);

    await this.prisma.hubspotSyncLog.create({
      data: {
        tenantId,
        entityType: 'CONTACT',
        entityId: contactId,
        hubspotId: contact.hubspotId || 'pending',
        syncDirection: 'TO_HUBSPOT',
        syncStatus: 'PENDING',
        payloadSent: {
          email: contact.email,
          firstname: contact.firstName,
          lastname: contact.lastName,
          phone: contact.phone,
        },
      },
    });

    return { success: true, hubspotId: contact.hubspotId || undefined };
  }

  // Sync opportunity/deal to HubSpot
  async syncDeal(tenantId: string, opportunityId: string): Promise<HubspotSyncResult> {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id: opportunityId, tenantId },
      include: { company: true },
    });

    if (!opportunity) {
      return { success: false, error: 'Opportunity not found' };
    }

    this.logger.log(`[STUB] Would sync opportunity ${opportunity.name} to HubSpot as deal`);

    await this.prisma.hubspotSyncLog.create({
      data: {
        tenantId,
        entityType: 'DEAL',
        entityId: opportunityId,
        hubspotId: opportunity.hubspotDealId || 'pending',
        syncDirection: 'TO_HUBSPOT',
        syncStatus: 'PENDING',
        payloadSent: {
          dealname: opportunity.name,
          amount: opportunity.estimatedValue,
          dealstage: this.mapStageToHubspot(opportunity.stage),
          closedate: opportunity.expectedCloseDate,
        },
      },
    });

    return { success: true, hubspotId: opportunity.hubspotDealId || undefined };
  }

  // Bulk sync companies
  async bulkSyncCompanies(tenantId: string, companyIds?: string[]): Promise<{ queued: number }> {
    const where: { tenantId: string; deletedAt: null; id?: { in: string[] } } = { tenantId, deletedAt: null };
    if (companyIds?.length) {
      where.id = { in: companyIds };
    }

    const companies = await this.prisma.company.findMany({
      where,
      select: { id: true },
    });

    this.logger.log(`[STUB] Queued ${companies.length} companies for HubSpot sync`);

    return { queued: companies.length };
  }

  // Bulk sync contacts
  async bulkSyncContacts(tenantId: string, contactIds?: string[]): Promise<{ queued: number }> {
    const where: { tenantId: string; deletedAt: null; id?: { in: string[] } } = { tenantId, deletedAt: null };
    if (contactIds?.length) {
      where.id = { in: contactIds };
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      select: { id: true },
    });

    this.logger.log(`[STUB] Queued ${contacts.length} contacts for HubSpot sync`);

    return { queued: contacts.length };
  }

  // Bulk sync deals
  async bulkSyncDeals(tenantId: string, opportunityIds?: string[]): Promise<{ queued: number }> {
    const where: { tenantId: string; deletedAt: null; id?: { in: string[] } } = { tenantId, deletedAt: null };
    if (opportunityIds?.length) {
      where.id = { in: opportunityIds };
    }

    const opportunities = await this.prisma.opportunity.findMany({
      where,
      select: { id: true },
    });

    this.logger.log(`[STUB] Queued ${opportunities.length} deals for HubSpot sync`);

    return { queued: opportunities.length };
  }

  // Get sync status
  async getSyncStatus(tenantId: string, options?: { limit?: number }) {
    const { limit = 50 } = options || {};

    const [recentLogs, pendingCount, failedCount] = await Promise.all([
      this.prisma.hubspotSyncLog.findMany({
        where: { tenantId },
        orderBy: { syncedAt: 'desc' },
        take: limit,
      }),
      this.prisma.hubspotSyncLog.count({
        where: { tenantId, syncStatus: 'PENDING' },
      }),
      this.prisma.hubspotSyncLog.count({
        where: { tenantId, syncStatus: 'FAILED' },
      }),
    ]);

    return {
      recentLogs,
      pendingCount,
      failedCount,
      isConfigured: await this.isConfigured(tenantId),
    };
  }

  // Handle incoming webhook from HubSpot
  async handleWebhook(tenantId: string, payload: Record<string, unknown>): Promise<{ processed: boolean }> {
    this.logger.log(`[STUB] Received HubSpot webhook for tenant ${tenantId}`);
    this.logger.debug('Webhook payload:', payload);

    // In future, process webhook events:
    // - company.updated
    // - contact.updated
    // - deal.updated
    // - deal.created

    return { processed: true };
  }

  // Map internal stage to HubSpot deal stage
  private mapStageToHubspot(stage: string): string {
    const stageMap: Record<string, string> = {
      LEAD: 'appointmentscheduled',
      QUALIFIED: 'qualifiedtobuy',
      PROPOSAL: 'presentationscheduled',
      NEGOTIATION: 'decisionmakerboughtin',
      WON: 'closedwon',
      LOST: 'closedlost',
    };
    return stageMap[stage] || 'appointmentscheduled';
  }

  // Configure field mapping (stub)
  async configureFieldMapping(tenantId: string, _mapping: Record<string, string>): Promise<{ success: boolean }> {
    void _mapping; // Will be saved to tenant settings when implemented
    this.logger.log(`[STUB] Would configure field mapping for tenant ${tenantId}`);
    // In future, save to tenant settings
    return { success: true };
  }
}
