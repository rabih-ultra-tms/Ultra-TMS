import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  IsArray,
  Min,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum ProviderCategory {
  LOAD_BOARD = 'LOAD_BOARD',
  ACCOUNTING = 'ACCOUNTING',
  ELD = 'ELD',
  CRM = 'CRM',
  RATING = 'RATING',
  COMMUNICATION = 'COMMUNICATION',
  PAYMENT = 'PAYMENT',
  DOCUMENT = 'DOCUMENT',
}

export enum AuthType {
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  BASIC = 'BASIC',
  NONE = 'NONE',
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  PENDING_AUTH = 'PENDING_AUTH',
}

export enum ProviderStatus {
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  COMING_SOON = 'COMING_SOON',
}

export enum SyncFrequency {
  REALTIME = 'REALTIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  MANUAL = 'MANUAL',
}

export enum IntegrationEnvironment {
  PRODUCTION = 'PRODUCTION',
  SANDBOX = 'SANDBOX',
  TEST = 'TEST',
}

// ============================================
// PROVIDER DTOs
// ============================================
export class ProviderQueryDto {
  @IsOptional()
  @IsEnum(ProviderCategory)
  category?: ProviderCategory;

  @IsOptional()
  @IsEnum(ProviderStatus)
  status?: ProviderStatus;

  @IsOptional()
  @IsString()
  search?: string;
}

export class ProviderResponseDto {
  id!: string;
  code!: string;
  name!: string;
  category!: string;
  description?: string;
  configSchema!: Record<string, unknown>;
  authType!: string;
  oauthConfig?: Record<string, unknown>;
  baseUrl?: string;
  apiVersion?: string;
  documentationUrl?: string;
  supportsWebhooks!: boolean;
  supportsBatch!: boolean;
  supportsRealtime!: boolean;
  rateLimitRequests?: number;
  rateLimitWindow?: number;
  status!: string;
}

// ============================================
// INTEGRATION DTOs
// ============================================
export class IntegrationQueryDto {
  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @IsOptional()
  @IsEnum(IntegrationEnvironment)
  environment?: IntegrationEnvironment;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

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
  providerId!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(IntegrationEnvironment)
  environment?: IntegrationEnvironment;

  @IsEnum(AuthType)
  authType!: AuthType;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsObject()
  oauthTokens?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutSecs?: number;
}

export class UpdateIntegrationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  retryEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutSecs?: number;
}

export class IntegrationResponseDto {
  id!: string;
  name!: string;
  description?: string;
  providerId!: string;
  providerCode?: string;
  providerName?: string;
  config!: Record<string, unknown>;
  environment!: string;
  authType!: string;
  hasApiKey!: boolean;
  hasOauthTokens!: boolean;
  oauthExpiresAt?: Date;
  status!: string;
  lastSuccessfulCall?: Date;
  lastError?: string;
  lastErrorAt?: Date;
  errorCount!: number;
  isEnabled!: boolean;
  retryEnabled!: boolean;
  maxRetries!: number;
  timeoutSecs!: number;
  syncFrequency?: string;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
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
  integrationId!: string;
  status!: string;
  lastSuccessfulCall?: Date;
  lastError?: string;
  errorCount!: number;
  circuitBreakerState?: string;
  rateLimitUsage?: number;
  rateLimitMax?: number;
}

export class IntegrationStatsDto {
  integrationId!: string;
  totalRequests!: number;
  successfulRequests!: number;
  failedRequests!: number;
  averageResponseTime!: number;
  requestsToday!: number;
  requestsThisWeek!: number;
  requestsThisMonth!: number;
}

// Additional DTOs
export class TestConnectionDto {
  @IsOptional()
  @IsBoolean()
  verbose?: boolean;
}

export class OAuthRefreshDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
