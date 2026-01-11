import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class ContractTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.contractTemplate.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  create(tenantId: string, userId: string, dto: CreateTemplateDto) {
    return this.prisma.contractTemplate.create({
      data: {
        tenantId,
        templateName: dto.templateName,
        contractType: dto.contractType,
        templateContent: dto.templateContent,
        defaultTerms: dto.defaultTerms ?? null,
        isActive: dto.isActive ?? true,
        createdById: userId,
      },
    });
  }

  async detail(tenantId: string, id: string) {
    const template = await this.prisma.contractTemplate.findFirst({ where: { id, tenantId } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateTemplateDto) {
    await this.detail(tenantId, id);
    return this.prisma.contractTemplate.update({ where: { id }, data: dto });
  }

  async delete(tenantId: string, id: string) {
    await this.detail(tenantId, id);
    await this.prisma.contractTemplate.delete({ where: { id } });
    return { success: true };
  }

  async clone(tenantId: string, id: string, userId: string) {
    const template = await this.detail(tenantId, id);
    return this.prisma.contractTemplate.create({
      data: {
        tenantId,
        templateName: `${template.templateName} Copy`,
        contractType: template.contractType,
        templateContent: template.templateContent,
        defaultTerms: template.defaultTerms,
        isActive: template.isActive,
        createdById: userId,
      },
    });
  }
}
