import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AuthType, IntegrationCategory, SyncFrequency } from '@prisma/client';

export class ProviderQueryDto {
  @IsOptional()
  @IsString()
  category?: string;
}

export class ProviderResponseDto {
  id!: string;
  providerName!: string;
  category!: string;
  authType!: string;
  baseUrl?: string | null;
  documentationUrl?: string | null;
  logoUrl?: string | null;
  isActive!: boolean;
}

export class IntegrationQueryDto {
  @IsOptional()
  @IsEnum(IntegrationCategory)
  category?: IntegrationCategory;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateIntegrationDto {
  @IsString()
  name!: string;

  @IsEnum(IntegrationCategory)
  category!: IntegrationCategory;

  @IsString()
  provider!: string;

  @IsEnum(AuthType)
  authType!: AuthType;

  @IsObject()
  config!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsObject()
  oauthTokens?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateIntegrationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(IntegrationCategory)
  category?: IntegrationCategory;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsEnum(AuthType)
  authType?: AuthType;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsObject()
  oauthTokens?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsString()
  status?: string;
}

export class IntegrationResponseDto {
  id!: string;
  tenantId!: string;
  name!: string;
  description?: string | null;
  category!: IntegrationCategory;
  provider!: string;
  authType!: AuthType;
  config!: Record<string, unknown>;
  syncFrequency!: SyncFrequency;
  status!: string;
  lastSyncAt?: Date | null;
  nextSyncAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class IntegrationListResponseDto {
  data!: IntegrationResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class IntegrationHealthDto {
  id!: string;
  status!: string;
  lastSyncAt?: Date | null;
  nextSyncAt?: Date | null;
}

export class IntegrationStatsDto {
  integrationId!: string;
  totalRequests!: number;
  successfulRequests!: number;
  failedRequests!: number;
  averageDurationMs!: number;
}

export class ToggleStatusDto {
  @IsString()
  status!: string;
}

export class ApiLogQueryDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ApiLogResponseDto {
  id!: string;
  integrationId!: string;
  endpoint!: string;
  method!: string;
  responseStatus!: number;
  durationMs!: number;
  timestamp!: Date;
}

export class ApiLogListResponseDto {
  data!: ApiLogResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
