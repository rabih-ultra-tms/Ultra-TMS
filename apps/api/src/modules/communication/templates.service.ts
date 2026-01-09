import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateTemplateDto, UpdateTemplateDto } from './dto';

export interface TemplateListOptions {
  page?: number;
  limit?: number;
  channel?: string;
  category?: string;
  status?: string;
  search?: string;
}

// Standard template codes
export const TEMPLATE_CODES = {
  // Load related
  LOAD_ASSIGNED: 'LOAD_ASSIGNED',
  LOAD_STATUS_UPDATE: 'LOAD_STATUS_UPDATE',
  POD_REQUIRED: 'POD_REQUIRED',
  RATE_CONFIRMATION: 'RATE_CONFIRMATION',
  TRACKING_UPDATE: 'TRACKING_UPDATE',

  // Carrier related
  CARRIER_COMPLIANCE_EXPIRING: 'CARRIER_COMPLIANCE_EXPIRING',
  CARRIER_WELCOME: 'CARRIER_WELCOME',

  // Customer related
  INVOICE_CREATED: 'INVOICE_CREATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  QUOTE_SENT: 'QUOTE_SENT',

  // Document related
  DOCUMENT_RECEIVED: 'DOCUMENT_RECEIVED',
  DOCUMENT_SHARED: 'DOCUMENT_SHARED',

  // System
  WELCOME_USER: 'WELCOME_USER',
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
};

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateTemplateDto) {
    // Check for duplicate code+channel
    const existing = await this.prisma.communicationTemplate.findUnique({
      where: {
        tenantId_code_channel: {
          tenantId,
          code: dto.code,
          channel: dto.channel,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Template with code "${dto.code}" and channel "${dto.channel}" already exists`,
      );
    }

    const template = await this.prisma.communicationTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        channel: dto.channel,
        subjectEn: dto.subjectEn,
        subjectEs: dto.subjectEs,
        bodyEn: dto.bodyEn,
        bodyEs: dto.bodyEs,
        fromName: dto.fromName,
        fromEmail: dto.fromEmail,
        replyTo: dto.replyTo,
        isSystem: dto.isSystem ?? false,
        createdById: userId,
      },
    });

    this.logger.log(`Template created: ${template.code} (${template.id})`);
    return template;
  }

  async findAll(tenantId: string, options: TemplateListOptions) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (options.channel) {
      where.channel = options.channel;
    }

    if (options.category) {
      where.category = options.category;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { code: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [templates, total] = await Promise.all([
      this.prisma.communicationTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communicationTemplate.count({ where }),
    ]);

    return {
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.communicationTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException(`Template not found: ${id}`);
    }

    return template;
  }

  async findByCode(tenantId: string, code: string, channel: string) {
    const template = await this.prisma.communicationTemplate.findUnique({
      where: {
        tenantId_code_channel: {
          tenantId,
          code,
          channel,
        },
      },
    });

    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateTemplateDto) {
    const existing = await this.findOne(tenantId, id);

    // If changing code/channel, check for conflicts
    if (dto.code || dto.channel) {
      const newCode = dto.code || existing.code;
      const newChannel = dto.channel || existing.channel;

      if (newCode !== existing.code || newChannel !== existing.channel) {
        const conflict = await this.prisma.communicationTemplate.findUnique({
          where: {
            tenantId_code_channel: {
              tenantId,
              code: newCode,
              channel: newChannel,
            },
          },
        });

        if (conflict && conflict.id !== id) {
          throw new ConflictException(
            `Template with code "${newCode}" and channel "${newChannel}" already exists`,
          );
        }
      }
    }

    const template = await this.prisma.communicationTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        category: dto.category,
        channel: dto.channel,
        subjectEn: dto.subjectEn,
        subjectEs: dto.subjectEs,
        bodyEn: dto.bodyEn,
        bodyEs: dto.bodyEs,
        fromName: dto.fromName,
        fromEmail: dto.fromEmail,
        replyTo: dto.replyTo,
        status: dto.status,
      },
    });

    this.logger.log(`Template updated: ${template.code} (${template.id})`);
    return template;
  }

  async delete(tenantId: string, id: string) {
    const template = await this.findOne(tenantId, id);

    if (template.isSystem) {
      throw new ConflictException('Cannot delete system templates');
    }

    await this.prisma.communicationTemplate.delete({ where: { id } });

    this.logger.log(`Template deleted: ${template.code} (${id})`);
    return { success: true, message: 'Template deleted' };
  }

  async clone(tenantId: string, id: string, userId: string) {
    const source = await this.findOne(tenantId, id);

    // Find a unique code
    let newCode = `${source.code}_COPY`;
    let counter = 1;
    while (
      await this.prisma.communicationTemplate.findUnique({
        where: {
          tenantId_code_channel: {
            tenantId,
            code: newCode,
            channel: source.channel,
          },
        },
      })
    ) {
      newCode = `${source.code}_COPY_${counter}`;
      counter++;
    }

    const cloned = await this.prisma.communicationTemplate.create({
      data: {
        tenantId,
        name: `${source.name} (Copy)`,
        code: newCode,
        description: source.description,
        category: source.category,
        channel: source.channel,
        subjectEn: source.subjectEn,
        subjectEs: source.subjectEs,
        bodyEn: source.bodyEn,
        bodyEs: source.bodyEs,
        fromName: source.fromName,
        fromEmail: source.fromEmail,
        replyTo: source.replyTo,
        isSystem: false,
        createdById: userId,
      },
    });

    this.logger.log(
      `Template cloned: ${source.code} -> ${cloned.code} (${cloned.id})`,
    );
    return cloned;
  }

  async getTemplateCodes() {
    return Object.entries(TEMPLATE_CODES).map(([key, value]) => ({
      code: value,
      description: key.replace(/_/g, ' ').toLowerCase(),
    }));
  }

  async preview(
    tenantId: string,
    templateId: string,
    variables: Record<string, any>,
    language: 'en' | 'es' = 'en',
  ) {
    const template = await this.findOne(tenantId, templateId);

    const subject = this.renderTemplate(
      language === 'es' ? template.subjectEs || template.subjectEn : template.subjectEn,
      variables,
    );

    const body = this.renderTemplate(
      language === 'es' ? template.bodyEs || template.bodyEn : template.bodyEn,
      variables,
    );

    return {
      subject,
      body,
      channel: template.channel,
      language,
    };
  }

  renderTemplate(
    template: string | null,
    variables: Record<string, any>,
  ): string {
    if (!template) return '';

    let rendered = template;

    // Add standard variables
    const standardVars = {
      currentDate: new Date().toLocaleDateString(),
      currentYear: new Date().getFullYear().toString(),
      appUrl: process.env.APP_URL || 'https://app.ultratms.com',
    };

    const allVars = { ...standardVars, ...variables };

    // Replace {{variable}} and {{object.property}} patterns
    rendered = rendered.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(allVars, path.trim());
      return value !== undefined ? String(value) : match;
    });

    return rendered;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
