import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsObject,
  Min,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum SyncJobType {
  FULL_SYNC = 'FULL_SYNC',
  INCREMENTAL = 'INCREMENTAL',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export enum SyncDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum SyncJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ApiLogDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum ApiLogStatus {
  SUCCESS = 'SUCCESS',
  CLIENT_ERROR = 'CLIENT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

// ============================================
// SYNC JOB DTOs
// ============================================
export class CreateSyncJobDto {
  @IsString()
  integrationId!: string;

  @IsEnum(SyncJobType)
  jobType!: SyncJobType;

  @IsString()
  entityType!: string;

  @IsEnum(SyncDirection)
  direction!: SyncDirection;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}

export class SyncJobQueryDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsEnum(SyncJobStatus)
  status?: SyncJobStatus;

  @IsOptional()
  @IsEnum(SyncJobType)
  jobType?: SyncJobType;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class SyncJobResponseDto {
  id!: string;
  integrationId!: string;
  integrationName?: string;
  jobType!: string;
  entityType!: string;
  direction!: string;
  filters?: Record<string, unknown>;
  status!: string;
  startedAt?: Date;
  completedAt?: Date;
  totalRecords!: number;
  processedRecords!: number;
  successCount!: number;
  errorCount!: number;
  errorDetails?: Record<string, unknown>[];
  scheduledBy?: string;
  scheduledAt?: Date;
  createdAt!: Date;
  createdBy?: string;
}

export class SyncJobListResponseDto {
  data!: SyncJobResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class SyncJobProgressDto {
  id!: string;
  status!: string;
  totalRecords!: number;
  processedRecords!: number;
  successCount!: number;
  errorCount!: number;
  progressPercent!: number;
}

// ============================================
// API LOG DTOs
// ============================================
export class ApiLogQueryDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsEnum(ApiLogDirection)
  direction?: ApiLogDirection;

  @IsOptional()
  @IsEnum(ApiLogStatus)
  status?: ApiLogStatus;

  @IsOptional()
  @IsString()
  correlationId?: string;

  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  path?: string;

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
  integrationId?: string;
  integrationName?: string;
  direction!: string;
  method!: string;
  url!: string;
  path?: string;
  queryParams?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  body?: string;
  bodySize?: number;
  responseStatus?: number;
  responseHeaders?: Record<string, unknown>;
  responseBody?: string;
  responseSize?: number;
  responseTimeMs?: number;
  correlationId?: string;
  userId?: string;
  sourceIp?: string;
  status!: string;
  errorMessage?: string;
  retryOf?: string;
  createdAt!: Date;
}

export class ApiLogListResponseDto {
  data!: ApiLogResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

// ============================================
// TRANSFORMATION DTOs
// ============================================
export class CreateTransformationDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  sourceFormat!: string;

  @IsString()
  targetFormat!: string;

  @IsObject()
  mappingRules!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  validationRules?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  category?: string;
}

export class UpdateTransformationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  mappingRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  validationRules?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TransformationResponseDto {
  id!: string;
  code!: string;
  name!: string;
  description?: string;
  sourceFormat!: string;
  targetFormat!: string;
  mappingRules!: Record<string, unknown>;
  validationRules?: Record<string, unknown>;
  isSystem!: boolean;
  category?: string;
  version!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TransformationListResponseDto {
  data!: TransformationResponseDto[];
  total!: number;
}

export class TransformPreviewDto {
  @IsObject()
  sourceData!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  mappingRules?: Record<string, unknown>;
}

export class TransformPreviewResponseDto {
  success!: boolean;
  result?: Record<string, unknown>;
  errors?: string[];
}
