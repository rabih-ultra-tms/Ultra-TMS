import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TemplatesService } from './templates.service';
import { GenerateDocumentDto, EntityType } from './dto';

@Injectable()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
  ) {}

  async generateDocument(
    tenantId: string,
    userId: string,
    dto: GenerateDocumentDto,
  ) {
    // Get template
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id: dto.templateId, tenantId, status: 'ACTIVE' },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Get entity data
    const entityData = await this.getEntityData(tenantId, dto.entityType, dto.entityId);

    if (!entityData) {
      throw new NotFoundException('Entity not found');
    }

    // Create generation record
    const generatedDoc = await this.prisma.generatedDocument.create({
      data: {
        tenantId,
        templateId: dto.templateId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        dataSnapshot: {
          ...entityData,
          ...dto.additionalData,
          generatedAt: new Date().toISOString(),
        },
        status: 'GENERATING',
        requestedBy: userId,
      },
    });

    // In production, this would be a background job
    // For now, we'll simulate document generation
    try {
      const document = await this.performGeneration(
        tenantId,
        userId,
        generatedDoc.id,
        template,
        { ...entityData, ...dto.additionalData },
      );

      return {
        generatedDocumentId: generatedDoc.id,
        documentId: document.id,
        status: 'COMPLETED',
      };
    } catch (error) {
      await this.prisma.generatedDocument.update({
        where: { id: generatedDoc.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  async batchGenerate(
    tenantId: string,
    userId: string,
    templateId: string,
    entities: Array<{ entityType: EntityType; entityId: string }>,
  ) {
    const results = [];

    for (const entity of entities) {
      try {
        const result = await this.generateDocument(tenantId, userId, {
          templateId,
          entityType: entity.entityType,
          entityId: entity.entityId,
        });
        results.push({ ...entity, ...result });
      } catch (error) {
        results.push({
          ...entity,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      total: entities.length,
      successful: results.filter((r) => r.status === 'COMPLETED').length,
      failed: results.filter((r) => r.status === 'FAILED').length,
      results,
    };
  }

  async getGenerationStatus(tenantId: string, generatedDocId: string) {
    const generatedDoc = await this.prisma.generatedDocument.findFirst({
      where: { id: generatedDocId, tenantId },
      include: {
        template: { select: { id: true, name: true, templateType: true } },
        document: { select: { id: true, name: true, filePath: true } },
      },
    });

    if (!generatedDoc) {
      throw new NotFoundException('Generated document not found');
    }

    return generatedDoc;
  }

  async generateRateConfirmation(tenantId: string, userId: string, loadId: string) {
    const template = await this.templatesService.getDefaultTemplate(tenantId, 'RATE_CONFIRM');

    if (!template) {
      throw new BadRequestException('No rate confirmation template found');
    }

    return this.generateDocument(tenantId, userId, {
      templateId: template.id,
      entityType: EntityType.LOAD,
      entityId: loadId,
    });
  }

  async generateBOL(tenantId: string, userId: string, loadId: string) {
    const template = await this.templatesService.getDefaultTemplate(tenantId, 'BOL');

    if (!template) {
      throw new BadRequestException('No BOL template found');
    }

    return this.generateDocument(tenantId, userId, {
      templateId: template.id,
      entityType: EntityType.LOAD,
      entityId: loadId,
    });
  }

  async generateInvoice(tenantId: string, userId: string, orderId: string) {
    const template = await this.templatesService.getDefaultTemplate(tenantId, 'INVOICE');

    if (!template) {
      throw new BadRequestException('No invoice template found');
    }

    return this.generateDocument(tenantId, userId, {
      templateId: template.id,
      entityType: EntityType.ORDER,
      entityId: orderId,
    });
  }

  private async getEntityData(
    tenantId: string,
    entityType: string,
    entityId: string,
  ): Promise<Record<string, unknown> | null> {
    switch (entityType) {
      case 'LOAD':
        return this.getLoadData(tenantId, entityId);
      case 'ORDER':
        return this.getOrderData(tenantId, entityId);
      case 'CARRIER':
        return this.getCarrierData(tenantId, entityId);
      case 'COMPANY':
        return this.getCompanyData(tenantId, entityId);
      default:
        return null;
    }
  }

  private async getLoadData(tenantId: string, loadId: string) {
    const load = await this.prisma.load.findFirst({
      where: { id: loadId, tenantId },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
        stops: {
          orderBy: { stopSequence: 'asc' },
        },
      },
    });

    if (!load) return null;

    return {
      load: {
        loadNumber: load.loadNumber,
        status: load.status,
        carrierRate: load.carrierRate,
        customerRate: load.order?.customerRate,
      },
      order: load.order ? {
        orderNumber: load.order.orderNumber,
      } : null,
      customer: load.order?.customer ? {
        name: load.order.customer.name,
        address: load.order.customer.addressLine1,
        city: load.order.customer.city,
        state: load.order.customer.state,
        zip: load.order.customer.postalCode,
      } : null,
      stops: load.stops.map((stop) => ({
        type: stop.stopType,
        facilityName: stop.facilityName,
        address: stop.addressLine1,
        city: stop.city,
        state: stop.state,
        zip: stop.postalCode,
        appointmentDate: stop.appointmentDate,
      })),
      origin: load.stops.find((s) => s.stopType === 'PICKUP'),
      destination: load.stops.find((s) => s.stopType === 'DELIVERY'),
    };
  }

  private async getOrderData(tenantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: {
        customer: true,
        loads: true,
        items: true,
      },
    });

    if (!order) return null;

    return {
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        totalCharges: order.totalCharges,
        orderDate: order.orderDate,
      },
      customer: {
        name: order.customer.name,
        address: order.customer.addressLine1,
        city: order.customer.city,
        state: order.customer.state,
        zip: order.customer.postalCode,
        phone: order.customer.phone,
        email: order.customer.email,
      },
      loads: order.loads.map((load) => ({
        loadNumber: load.loadNumber,
        status: load.status,
      })),
      items: order.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        weight: item.weightLbs,
      })),
    };
  }

  private async getCarrierData(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId },
    });

    if (!carrier) return null;

    return {
      carrier: {
        name: carrier.legalName,
        dbaName: carrier.dbaName,
        mcNumber: carrier.mcNumber,
        dotNumber: carrier.dotNumber,
        scacCode: carrier.scacCode,
        address: carrier.address,
        city: carrier.city,
        state: carrier.state,
        zip: carrier.zipCode,
        phone: carrier.phone,
        email: carrier.email,
      },
    };
  }

  private async getCompanyData(tenantId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, tenantId },
    });

    if (!company) return null;

    return {
      company: {
        name: company.name,
        address: company.addressLine1,
        city: company.city,
        state: company.state,
        zip: company.postalCode,
        phone: company.phone,
        email: company.email,
      },
    };
  }

  private async performGeneration(
    tenantId: string,
    userId: string,
    generatedDocId: string,
    template: any,
    data: Record<string, unknown>,
  ) {
    // In production, use a PDF generation library like PDFKit or Puppeteer
    // For now, we'll create a placeholder document record

    const documentName = this.generateDocumentName(template.templateType, data);

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        name: documentName,
        description: `Generated from template: ${template.name}`,
        documentType: template.templateType,
        fileName: `${documentName}.pdf`,
        filePath: `${tenantId}/generated/${Date.now()}-${documentName}.pdf`,
        fileSize: 0, // Will be updated after actual generation
        mimeType: 'application/pdf',
        fileExtension: '.pdf',
        storageProvider: 'S3',
        bucketName: process.env.S3_BUCKET || 'ultra-tms-documents',
        metadata: {
          generatedDocumentId: generatedDocId,
          templateId: template.id,
          templateName: template.name,
        },
        uploadedBy: userId,
      },
    });

    // Update generated document record
    await this.prisma.generatedDocument.update({
      where: { id: generatedDocId },
      data: {
        documentId: document.id,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return document;
  }

  private generateDocumentName(templateType: string, data: Record<string, unknown>): string {
    const timestamp = new Date().toISOString().split('T')[0];

    switch (templateType) {
      case 'RATE_CONFIRM':
        return `Rate-Confirmation-${(data.load as any)?.loadNumber || 'unknown'}-${timestamp}`;
      case 'BOL':
        return `BOL-${(data.load as any)?.loadNumber || 'unknown'}-${timestamp}`;
      case 'INVOICE':
        return `Invoice-${(data.order as any)?.orderNumber || 'unknown'}-${timestamp}`;
      default:
        return `Document-${timestamp}`;
    }
  }
}
