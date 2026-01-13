import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { SearchEntityType } from '@prisma/client';

export class GlobalSearchDto {
  @IsString()
  @MinLength(2)
  q!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class EntitySearchDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facets?: string[];
}

export class CreateSavedSearchDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SearchEntityType)
  entityType!: SearchEntityType;

  @IsOptional()
  @IsString()
  queryText?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateSavedSearchDto {
  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  queryText?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateSynonymDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  terms!: string[];

  @IsOptional()
  @IsBoolean()
  isBidirectional?: boolean;

  @IsOptional()
  @IsString()
  primaryTerm?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];
}

export class ShareSavedSearchDto {
  @IsBoolean()
  isPublic!: boolean;
}

export class QueueQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class SearchAnalyticsDto {
  totalQueries!: number;
  uniqueUsers!: number;
  topEntities!: Array<{ entityType: string; count: number }>;
  topTerms!: Array<{ term: string; count: number }>;
}

export class SearchResultDto {
  total!: number;
  items!: Array<Record<string, unknown>>;
  facets?: Record<string, unknown>;
}

export class SuggestionResultDto {
  suggestions!: string[];
}

export class SavedSearchResponseDto {
  id!: string;
  name!: string;
  description?: string | null;
  entityType!: SearchEntityType;
  queryText?: string | null;
  filters?: Record<string, unknown>;
  isPublic!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SynonymResponseDto {
  id!: string;
  terms!: string[];
  isBidirectional!: boolean;
  primaryTerm?: string | null;
  entityTypes?: string[] | null;
  createdAt!: Date;
  updatedAt!: Date;
}
