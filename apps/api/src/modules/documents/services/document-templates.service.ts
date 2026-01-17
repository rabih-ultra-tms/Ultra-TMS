import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateDocumentTemplateDto, UpdateDocumentTemplateDto } from '../dto';

@Injectable()
export class DocumentTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateDocumentTemplateDto,
    userId?: string
  ) {
    return this.prisma.documentTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        templateType: dto.templateType,
        templateFormat: dto.templateFormat,
        templateContent: dto.templateContent,
        templateFilePath: dto.templateFilePath,
        paperSize: dto.paperSize || 'LETTER',
        orientation: dto.orientation || 'PORTRAIT',
        margins: dto.margins || { top: 1, bottom: 1, left: 1, right: 1 },
        includeLogo: dto.includeLogo ?? true,
        logoPosition: dto.logoPosition || 'TOP_LEFT',
        headerContent: dto.headerContent,
        footerContent: dto.footerContent,
        isDefault: dto.isDefault || false,
        language: dto.language || 'en',
        createdById: userId,
      },
    });
  }

  async findAll(tenantId: string, templateType?: string) {
    const where: Record<string, any> = { tenantId, deletedAt: null };

    if (templateType) {
      where.templateType = templateType;
    }

    return this.prisma.documentTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!template) {
      throw new NotFoundException('Document template not found');
    }

    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateDocumentTemplateDto) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!template) {
      throw new NotFoundException('Document template not found');
    }

    return this.prisma.documentTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!template) {
      throw new NotFoundException('Document template not found');
    }

    return this.prisma.documentTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getDefault(tenantId: string, templateType: string) {
    return this.prisma.documentTemplate.findFirst({
      where: {
        tenantId,
        templateType,
        isDefault: true,
        deletedAt: null,
        status: 'ACTIVE',
      },
    });
  }
}
