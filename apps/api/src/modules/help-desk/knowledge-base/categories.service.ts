import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma.service';
import { CreateKbCategoryDto, UpdateKbCategoryDto } from '../dto/help-desk.dto';

@Injectable()
export class CategoriesService {
  private readonly configKey = 'helpdesk.kb.categories';

  constructor(private readonly prisma: PrismaService) {}

  private slugify(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private async loadCategories(tenantId: string) {
    const record = await this.prisma.tenantConfig.findFirst({ where: { tenantId, configKey: this.configKey } });
    return (record?.configValue as any[]) ?? [];
  }

  private async saveCategories(tenantId: string, categories: any[]) {
    const payload = { tenantId, configKey: this.configKey };
    await this.prisma.tenantConfig.upsert({
      where: { tenantId_configKey: payload },
      create: { ...payload, configValue: categories },
      update: { configValue: categories },
    });
  }

  async listCategories(tenantId: string) {
    return this.loadCategories(tenantId);
  }

  async create(tenantId: string, dto: CreateKbCategoryDto) {
    const categories = await this.loadCategories(tenantId);
    const slug = dto.slug ?? this.slugify(dto.name);
    const category = {
      id: randomUUID(),
      name: dto.name,
      slug,
      description: dto.description ?? null,
      icon: dto.icon ?? null,
      parentId: dto.parentId ?? null,
      displayOrder: dto.displayOrder ?? categories.length,
      isPublic: dto.isPublic ?? true,
      isActive: dto.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    categories.push(category);
    await this.saveCategories(tenantId, categories);
    return category;
  }

  async update(tenantId: string, id: string, dto: UpdateKbCategoryDto) {
    const categories = await this.loadCategories(tenantId);
    const existing = categories.find((c) => c.id === id);
    if (!existing) throw new NotFoundException('Category not found');
    const updated = {
      ...existing,
      name: dto.name ?? existing.name,
      slug: dto.slug ?? existing.slug,
      description: dto.description ?? existing.description,
      icon: dto.icon ?? existing.icon,
      parentId: dto.parentId ?? existing.parentId,
      displayOrder: dto.displayOrder ?? existing.displayOrder,
      isPublic: dto.isPublic ?? existing.isPublic,
      isActive: dto.isActive ?? existing.isActive,
    };
    const next = categories.map((c) => (c.id === id ? updated : c));
    await this.saveCategories(tenantId, next);
    return updated;
  }
}
