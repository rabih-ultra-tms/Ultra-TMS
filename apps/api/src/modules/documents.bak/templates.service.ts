import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateQueryDto,
} from './dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateTemplateDto) {
    // Check for duplicate name + type
    const existing = await this.prisma.documentTemplate.findFirst({
      where: {
        tenantId,
        name: dto.name,
        templateType: dto.templateType,
      },
    });

    if (existing) {
      throw new ConflictException('Template with this name and type already exists');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.documentTemplate.updateMany({
        where: {
          tenantId,
          templateType: dto.templateType,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.documentTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        templateType: dto.templateType,
        templateFormat: dto.templateFormat,
        templateContent: dto.templateContent,
        paperSize: dto.paperSize || 'LETTER',
        orientation: dto.orientation || 'PORTRAIT',
        margins: dto.margins || { top: 1, bottom: 1, left: 1, right: 1 },
        includeLogo: dto.includeLogo ?? true,
        headerContent: dto.headerContent,
        footerContent: dto.footerContent,
        isDefault: dto.isDefault || false,
        language: dto.language || 'en',
        createdBy: userId,
      },
    });
  }

  async findAll(tenantId: string, query: TemplateQueryDto) {
    const { templateType, search, includeInactive } = query;

    const where: any = {
      tenantId,
    };

    if (!includeInactive) {
      where.status = 'ACTIVE';
    }

    if (templateType) {
      where.templateType = templateType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.documentTemplate.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateTemplateDto) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault && !template.isDefault) {
      await this.prisma.documentTemplate.updateMany({
        where: {
          tenantId,
          templateType: dto.templateType || template.templateType,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.documentTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if template is in use
    const usageCount = await this.prisma.generatedDocument.count({
      where: { templateId: id },
    });

    if (usageCount > 0) {
      // Soft delete by setting status to inactive
      return this.prisma.documentTemplate.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
    }

    await this.prisma.documentTemplate.delete({ where: { id } });
    return { success: true };
  }

  async preview(tenantId: string, id: string, data: Record<string, unknown>) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // In production, use Handlebars or similar to render the template
    // For now, return mock preview data
    return {
      previewHtml: this.renderTemplate(template.templateContent || '', data),
      template: {
        id: template.id,
        name: template.name,
        templateType: template.templateType,
      },
    };
  }

  async getDefaultTemplate(tenantId: string, templateType: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: {
        tenantId,
        templateType,
        isDefault: true,
        status: 'ACTIVE',
      },
    });

    if (!template) {
      // Try to find any active template of this type
      return this.prisma.documentTemplate.findFirst({
        where: {
          tenantId,
          templateType,
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return template;
  }

  private renderTemplate(content: string, data: Record<string, unknown>): string {
    // Simple template rendering (in production, use Handlebars)
    let rendered = content;
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    }

    return rendered;
  }
}
