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
import { ExecutionStatus, StepExecutionStatus } from './workflow.dto';

// ============================================
// EXECUTION DTOs
// ============================================
export class ExecutionQueryDto {
  @IsOptional()
  @IsString()
  workflowId?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  triggeredBy?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CancelExecutionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RetryExecutionDto {
  @IsOptional()
  @IsString()
  fromStepId?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================
export class StepExecutionResponseDto {
  id!: string;
  stepId?: string;
  stepOrder!: number;
  stepType!: string;
  stepName?: string;
  status!: string;
  inputData!: Record<string, unknown>;
  outputData!: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  retryCount!: number;
  createdAt!: Date;
}

export class ExecutionResponseDto {
  id!: string;
  workflowId!: string;
  workflowName?: string;
  executionNumber!: string;
  triggerType!: string;
  triggerEvent?: Record<string, unknown>;
  triggerData!: Record<string, unknown>;
  entityType?: string;
  entityId?: string;
  status!: string;
  currentStepId?: string;
  variables!: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  result!: Record<string, unknown>;
  errorMessage?: string;
  attemptNumber!: number;
  triggeredBy?: string;
  createdAt!: Date;
  stepExecutions?: StepExecutionResponseDto[];
}

export class ExecutionListResponseDto {
  data!: ExecutionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

// ============================================
// TEMPLATE DTOs
// ============================================
export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category!: string;

  @IsString()
  triggerType!: string;

  @IsObject()
  triggerConfigTemplate!: Record<string, unknown>;

  @IsArray()
  stepsTemplate!: unknown[];

  @IsOptional()
  @IsObject()
  parametersSchema?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  triggerType?: string;

  @IsOptional()
  @IsObject()
  triggerConfigTemplate?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  stepsTemplate?: unknown[];

  @IsOptional()
  @IsObject()
  parametersSchema?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UseTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}

export class TemplateResponseDto {
  id!: string;
  name!: string;
  description?: string;
  category!: string;
  triggerType!: string;
  triggerConfigTemplate!: Record<string, unknown>;
  stepsTemplate!: unknown[];
  parametersSchema!: Record<string, unknown>;
  isSystem!: boolean;
  isPublished!: boolean;
  usageCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TemplateListResponseDto {
  data!: TemplateResponseDto[];
  total!: number;
}
