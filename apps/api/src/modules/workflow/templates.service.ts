import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  UseTemplateDto,
  TemplateResponseDto,
  TemplateListResponseDto,
} from './dto';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, category?: string): Promise<TemplateListResponseDto> {
    const where: any = {
      OR: [
        { tenantId },
        { tenantId: null, isSystem: true },
      ],
      isPublished: true,
    };

    if (category) {
      where.category = category;
    }

    const templates = await this.prisma.workflowTemplate.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { usageCount: 'desc' }, { name: 'asc' }],
    });

    return {
      data: templates.map(t => this.toResponseDto(t)),
      total: templates.length,
    };
  }

  async findOne(tenantId: string, id: string): Promise<TemplateResponseDto> {
    const template = await this.prisma.workflowTemplate.findFirst({
      where: {
        id,
        OR: [
          { tenantId },
          { tenantId: null, isSystem: true },
        ],
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.toResponseDto(template);
  }

  async create(
    tenantId: string,
    userId: string,
    dto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const template = await this.prisma.workflowTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        triggerType: dto.triggerType,
        triggerConfigTemplate: dto.triggerConfigTemplate as any,
        stepsTemplate: dto.stepsTemplate as any,
        parametersSchema: (dto.parametersSchema || {}) as any,
        isSystem: false,
        isPublished: dto.isPublished ?? true,
        createdBy: userId,
      },
    });

    return this.toResponseDto(template);
  }

  async update(
    tenantId: string,
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const existing = await this.prisma.workflowTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Template not found or is a system template');
    }

    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.triggerType !== undefined) updateData.triggerType = dto.triggerType;
    if (dto.triggerConfigTemplate !== undefined) updateData.triggerConfigTemplate = dto.triggerConfigTemplate;
    if (dto.stepsTemplate !== undefined) updateData.stepsTemplate = dto.stepsTemplate;
    if (dto.parametersSchema !== undefined) updateData.parametersSchema = dto.parametersSchema;
    if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;

    await this.prisma.workflowTemplate.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(tenantId, id);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    const template = await this.prisma.workflowTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template not found or is a system template');
    }

    await this.prisma.workflowTemplate.delete({ where: { id } });
  }

  async useTemplate(
    tenantId: string,
    id: string,
    userId: string,
    dto: UseTemplateDto,
  ): Promise<{ workflowId: string }> {
    const template = await this.prisma.workflowTemplate.findFirst({
      where: {
        id,
        OR: [
          { tenantId },
          { tenantId: null, isSystem: true },
        ],
        isPublished: true,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Apply parameters to trigger config and steps
    let triggerConfig = JSON.parse(JSON.stringify(template.triggerConfigTemplate));
    let steps = JSON.parse(JSON.stringify(template.stepsTemplate));

    if (dto.parameters) {
      // Simple parameter substitution
      const paramsStr = JSON.stringify({ triggerConfig, steps });
      let replacedStr = paramsStr;
      
      for (const [key, value] of Object.entries(dto.parameters)) {
        const placeholder = `{{${key}}}`;
        replacedStr = replacedStr.replace(new RegExp(placeholder, 'g'), String(value));
      }
      
      const parsed = JSON.parse(replacedStr);
      triggerConfig = parsed.triggerConfig;
      steps = parsed.steps;
    }

    // Create workflow from template
    const workflow = await this.prisma.workflow.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        category: template.category,
        triggerType: template.triggerType,
        triggerConfig: triggerConfig as any,
        steps: steps as any,
        isActive: false,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Increment usage count
    await this.prisma.workflowTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return { workflowId: workflow.id };
  }

  private toResponseDto(template: any): TemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      triggerType: template.triggerType,
      triggerConfigTemplate: JSON.parse(JSON.stringify(template.triggerConfigTemplate || {})),
      stepsTemplate: JSON.parse(JSON.stringify(template.stepsTemplate || [])),
      parametersSchema: JSON.parse(JSON.stringify(template.parametersSchema || {})),
      isSystem: template.isSystem,
      isPublished: template.isPublished,
      usageCount: template.usageCount,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
