import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsObject,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// ENUMS
// ============================================
export enum WorkflowCategory {
  OPERATIONS = 'OPERATIONS',
  SALES = 'SALES',
  ACCOUNTING = 'ACCOUNTING',
  CARRIER = 'CARRIER',
  HR = 'HR',
  CUSTOM = 'CUSTOM',
}

export enum TriggerType {
  EVENT = 'EVENT',
  SCHEDULE = 'SCHEDULE',
  MANUAL = 'MANUAL',
  WEBHOOK = 'WEBHOOK',
}

export enum StepType {
  ACTION = 'ACTION',
  CONDITION = 'CONDITION',
  APPROVAL = 'APPROVAL',
  WAIT = 'WAIT',
  PARALLEL = 'PARALLEL',
  LOOP = 'LOOP',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  WAITING = 'WAITING',
}

export enum StepExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

// ============================================
// STEP DTOs
// ============================================
export class WorkflowStepDto {
  @IsInt()
  @Min(1)
  stepOrder!: number;

  @IsEnum(StepType)
  stepType!: StepType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  actionType?: string;

  @IsOptional()
  @IsObject()
  actionConfig?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  conditionExpression?: string;

  @IsOptional()
  @IsString()
  onSuccessStepId?: string;

  @IsOptional()
  @IsString()
  onFailureStepId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutMins?: number;
}

// ============================================
// TRIGGER CONFIG DTOs
// ============================================
export class EventTriggerConfigDto {
  @IsString()
  eventName!: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}

export class ScheduleTriggerConfigDto {
  @IsString()
  cron!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ManualTriggerConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];

  @IsOptional()
  @IsString()
  requiredEntity?: string;

  @IsOptional()
  @IsArray()
  inputForm?: Array<{
    field: string;
    type: string;
    required?: boolean;
    options?: string[];
  }>;
}

export class WebhookTriggerConfigDto {
  @IsString()
  endpointKey!: string;

  @IsOptional()
  @IsString()
  authentication?: string;

  @IsOptional()
  @IsObject()
  expectedPayload?: Record<string, string>;
}

// ============================================
// WORKFLOW DTOs
// ============================================
export class CreateWorkflowDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(WorkflowCategory)
  category!: WorkflowCategory;

  @IsEnum(TriggerType)
  triggerType!: TriggerType;

  @IsObject()
  triggerConfig!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  runAsUserId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  retryDelayMins?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutMins?: number;
}

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WorkflowCategory)
  category?: WorkflowCategory;

  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  runAsUserId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  retryDelayMins?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutMins?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  draftSteps?: WorkflowStepDto[];
}

export class WorkflowQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(WorkflowCategory)
  category?: WorkflowCategory;

  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ExecuteWorkflowDto {
  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsObject()
  triggerData?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;
}

export class CloneWorkflowDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================
export class WorkflowResponseDto {
  id!: string;
  name!: string;
  description?: string;
  category!: string;
  triggerType!: string;
  triggerConfig!: Record<string, unknown>;
  steps!: unknown[];
  isActive!: boolean;
  runAsUserId?: string;
  maxRetries!: number;
  retryDelayMins!: number;
  timeoutMins!: number;
  version!: number;
  publishedVersion!: number;
  draftSteps?: unknown[];
  executionCount!: number;
  lastExecutedAt?: Date;
  successCount!: number;
  failureCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class WorkflowListResponseDto {
  data!: WorkflowResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
