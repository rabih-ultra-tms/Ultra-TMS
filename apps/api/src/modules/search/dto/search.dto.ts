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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GlobalSearchDto {
  @ApiProperty({ description: 'Search query', minLength: 2 })
  @IsString()
  @MinLength(2)
  q!: string;

  @ApiPropertyOptional({ type: [String], description: 'Entity types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];

  @ApiPropertyOptional({ description: 'Limit', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}

export class EntitySearchDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ type: Object, description: 'Filter payload' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDirection?: string;

  @ApiPropertyOptional({ description: 'Limit', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ type: [String], description: 'Facet fields' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facets?: string[];
}

export class CreateSavedSearchDto {
  @ApiProperty({ description: 'Saved search name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SearchEntityType })
  @IsEnum(SearchEntityType)
  entityType!: SearchEntityType;

  @ApiPropertyOptional({ description: 'Query text' })
  @IsOptional()
  @IsString()
  queryText?: string;

  @ApiPropertyOptional({ type: Object, description: 'Filters' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Public flag' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateSavedSearchDto {
  @ApiPropertyOptional({ enum: SearchEntityType })
  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType;

  @ApiPropertyOptional({ description: 'Saved search name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Query text' })
  @IsOptional()
  @IsString()
  queryText?: string;

  @ApiPropertyOptional({ type: Object, description: 'Filters' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Public flag' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateSynonymDto {
  @ApiProperty({ type: [String], description: 'Synonym terms', minItems: 2 })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  terms!: string[];

  @ApiPropertyOptional({ description: 'Bidirectional flag' })
  @IsOptional()
  @IsBoolean()
  isBidirectional?: boolean;

  @ApiPropertyOptional({ description: 'Primary term' })
  @IsOptional()
  @IsString()
  primaryTerm?: string;

  @ApiPropertyOptional({ type: [String], description: 'Entity types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entityTypes?: string[];
}

export class ShareSavedSearchDto {
  @ApiProperty({ description: 'Public flag' })
  @IsBoolean()
  isPublic!: boolean;
}

export class QueueQueryDto {
  @ApiPropertyOptional({ description: 'Queue status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Limit', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class SearchAnalyticsDto {
  @ApiProperty({ description: 'Total queries' })
  totalQueries!: number;
  @ApiProperty({ description: 'Unique users' })
  uniqueUsers!: number;
  @ApiProperty({ type: [Object], description: 'Top entities' })
  topEntities!: Array<{ entityType: string; count: number }>;
  @ApiProperty({ type: [Object], description: 'Top terms' })
  topTerms!: Array<{ term: string; count: number }>;
}

export class SearchResultDto {
  @ApiProperty({ description: 'Total results' })
  total!: number;
  @ApiProperty({ type: [Object], description: 'Result items' })
  items!: Array<Record<string, unknown>>;
  @ApiPropertyOptional({ type: Object, description: 'Facets' })
  facets?: Record<string, unknown>;
}

export class SuggestionResultDto {
  @ApiProperty({ type: [String], description: 'Suggestions' })
  suggestions!: string[];
}

export class SavedSearchResponseDto {
  @ApiProperty({ description: 'Saved search ID' })
  id!: string;
  @ApiProperty({ description: 'Saved search name' })
  name!: string;
  @ApiPropertyOptional({ description: 'Description' })
  description?: string | null;
  @ApiProperty({ enum: SearchEntityType })
  entityType!: SearchEntityType;
  @ApiPropertyOptional({ description: 'Query text' })
  queryText?: string | null;
  @ApiPropertyOptional({ type: Object, description: 'Filters' })
  filters?: Record<string, unknown>;
  @ApiProperty({ description: 'Public flag' })
  isPublic!: boolean;
  @ApiProperty({ type: String, format: 'date-time', description: 'Created at' })
  createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', description: 'Updated at' })
  updatedAt!: Date;
}

export class SynonymResponseDto {
  @ApiProperty({ description: 'Synonym ID' })
  id!: string;
  @ApiProperty({ type: [String], description: 'Terms' })
  terms!: string[];
  @ApiProperty({ description: 'Bidirectional flag' })
  isBidirectional!: boolean;
  @ApiPropertyOptional({ description: 'Primary term' })
  primaryTerm?: string | null;
  @ApiPropertyOptional({ type: [String], description: 'Entity types' })
  entityTypes?: string[] | null;
  @ApiProperty({ type: String, format: 'date-time', description: 'Created at' })
  createdAt!: Date;
  @ApiProperty({ type: String, format: 'date-time', description: 'Updated at' })
  updatedAt!: Date;
}
