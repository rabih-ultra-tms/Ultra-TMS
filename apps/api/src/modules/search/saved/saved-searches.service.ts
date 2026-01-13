import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SearchEntityType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { EntitySearchService } from '../entities/entity-search.service';
import {
  CreateSavedSearchDto,
  EntitySearchDto,
  SavedSearchResponseDto,
  ShareSavedSearchDto,
  UpdateSavedSearchDto,
} from '../dto';

@Injectable()
export class SavedSearchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitySearchService: EntitySearchService,
  ) {}

  async listSaved(tenantId: string, userId: string): Promise<SavedSearchResponseDto[]> {
    const rows = await this.prisma.savedSearch.findMany({
      where: {
        tenantId,
        deletedAt: null,
        OR: [{ isPublic: true }, { userId }],
      },
      orderBy: [{ isPublic: 'desc' }, { updatedAt: 'desc' }],
    });

    return rows.map(r => this.toResponse(r));
  }

  async getSaved(tenantId: string, userId: string, id: string): Promise<SavedSearchResponseDto> {
    const saved = await this.prisma.savedSearch.findFirst({
      where: {
        id,
        tenantId,
        deletedAt: null,
        OR: [{ isPublic: true }, { userId }],
      },
    });

    if (!saved) {
      throw new NotFoundException('Saved search not found');
    }

    return this.toResponse(saved);
  }

  async createSaved(
    tenantId: string,
    userId: string,
    dto: CreateSavedSearchDto,
  ): Promise<SavedSearchResponseDto> {
    const saved = await this.prisma.savedSearch.create({
      data: {
        tenantId,
        userId,
        name: dto.name,
        description: dto.description,
        entityType: dto.entityType,
        query: { q: dto.queryText } as Prisma.InputJsonValue,
        filters: (dto.filters ?? {}) as Prisma.InputJsonValue,
        isPublic: dto.isPublic ?? false,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.toResponse(saved);
  }

  async updateSaved(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpdateSavedSearchDto,
  ): Promise<SavedSearchResponseDto> {
    await this.getSaved(tenantId, userId, id);

    const data: Prisma.SavedSearchUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.entityType !== undefined ? { entityType: dto.entityType } : {}),
      ...(dto.queryText !== undefined ? { query: { q: dto.queryText } as Prisma.InputJsonValue } : {}),
      ...(dto.filters !== undefined ? { filters: dto.filters as Prisma.InputJsonValue } : {}),
      ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
      updatedById: userId,
    };

    await this.prisma.savedSearch.update({ where: { id }, data });
    return this.getSaved(tenantId, userId, id);
  }

  async deleteSaved(tenantId: string, userId: string, id: string): Promise<void> {
    await this.getSaved(tenantId, userId, id);
    await this.prisma.savedSearch.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async executeSaved(tenantId: string, userId: string, id: string) {
    const saved = await this.prisma.savedSearch.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!saved) {
      throw new NotFoundException('Saved search not found');
    }

    const query = (saved.query as Record<string, unknown>) || {};
    const dto: EntitySearchDto = {
      q: (query.q as string) ?? undefined,
      filters: (saved.filters as Record<string, unknown>) ?? undefined,
    };

    const entityKey = this.entityKeyFromType(saved.entityType);
    return this.entitySearchService.search(tenantId, userId, entityKey, dto);
  }

  async shareSaved(tenantId: string, userId: string, id: string, dto: ShareSavedSearchDto) {
    await this.getSaved(tenantId, userId, id);
    await this.prisma.savedSearch.update({ where: { id }, data: { isPublic: dto.isPublic, updatedById: userId } });
    return this.getSaved(tenantId, userId, id);
  }

  private toResponse(saved: any): SavedSearchResponseDto {
    return {
      id: saved.id,
      name: saved.name,
      description: saved.description,
      entityType: saved.entityType as SearchEntityType,
      queryText: (saved.query as any)?.q ?? null,
      filters: saved.filters ? JSON.parse(JSON.stringify(saved.filters)) : undefined,
      isPublic: saved.isPublic,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  private entityKeyFromType(entityType: SearchEntityType): string {
    const map: Record<SearchEntityType, string> = {
      [SearchEntityType.ORDERS]: 'orders',
      [SearchEntityType.LOADS]: 'loads',
      [SearchEntityType.COMPANIES]: 'companies',
      [SearchEntityType.CARRIERS]: 'carriers',
      [SearchEntityType.CONTACTS]: 'contacts',
      [SearchEntityType.INVOICES]: 'invoices',
      [SearchEntityType.DOCUMENTS]: 'documents',
    };
    return map[entityType];
  }
}
