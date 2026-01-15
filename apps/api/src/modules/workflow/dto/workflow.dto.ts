import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  WAITING = 'WAITING',
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

export enum WorkflowExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  WAITING = 'WAITING',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class WorkflowStepDto {
  @ApiProperty({ description: 'Step order number', minimum: 1 })
  @IsInt()
  @Min(1)
  stepNumber!: number;

  @ApiProperty({ enum: StepType })
  @IsEnum(StepType)
  stepType!: StepType;

  @ApiPropertyOptional({ description: 'Step display name' })
  @IsOptional()
  @IsString()
  stepName?: string;

  @ApiPropertyOptional({ type: Object, description: 'Action configuration payload' })
  @IsOptional()
  @IsObject()
  actionConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Condition logic' })
  @IsOptional()
  @IsString()
  conditionLogic?: string;

  @ApiPropertyOptional({ description: 'Timeout in seconds', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeoutSeconds?: number;

  @ApiPropertyOptional({ type: Object, description: 'Retry configuration' })
  @IsOptional()
  @IsObject()
  retryConfig?: Record<string, unknown>;
}

export class CreateWorkflowDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TriggerType })
  @IsEnum(TriggerType)
  triggerType!: TriggerType;

  @ApiPropertyOptional({ description: 'Trigger event name' })
  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @ApiPropertyOptional({ type: Object, description: 'Trigger conditions' })
  @IsOptional()
  @IsObject()
  triggerConditions?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: WorkflowStatus })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({ type: [WorkflowStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];
}

export class UpdateWorkflowDto {
  @ApiPropertyOptional({ description: 'Workflow name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TriggerType })
  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @ApiPropertyOptional({ description: 'Trigger event name' })
  @IsOptional()
  @IsString()
  triggerEvent?: string;

  @ApiPropertyOptional({ type: Object, description: 'Trigger conditions' })
  @IsOptional()
  @IsObject()
  triggerConditions?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: WorkflowStatus })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({ type: [WorkflowStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps?: WorkflowStepDto[];
}

export class WorkflowQueryDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: WorkflowStatus })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({ enum: TriggerType })
  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ExecuteWorkflowDto {
  @ApiPropertyOptional({ type: Object, description: 'Trigger payload' })
  @IsOptional()
  @IsObject()
  triggerData?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ type: Object, description: 'Execution variables' })
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [String], description: 'Approver user IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  approverIds?: string[];
}

export class WorkflowStatsResponseDto {
  @ApiProperty({ description: 'Workflow ID' })
  workflowId!: string;
  @ApiProperty({ type: Object, description: 'Execution totals' })
  totals!: Record<string, number>;
  @ApiPropertyOptional({ description: 'Last execution time', type: String, format: 'date-time' })
  lastExecutedAt?: Date | null;
}
