import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ExecutionStatus, WorkflowExecutionStatus } from './workflow.dto';

export class ExecutionQueryDto {
  @IsOptional()
  @IsString()
  workflowId?: string;

  @IsOptional()
  @IsEnum(WorkflowExecutionStatus)
  status?: WorkflowExecutionStatus;

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
  @IsInt()
  @Min(1)
  fromStepNumber?: number;
}

export class ExecutionListResponseDto {
  data!: ExecutionResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class ExecutionResponseDto {
  id!: string;
  workflowId!: string;
  status!: WorkflowExecutionStatus;
  triggerData!: Record<string, unknown>;
  startedAt?: Date | null;
  completedAt?: Date | null;
  result?: Record<string, unknown> | null;
  errorMessage?: string | null;
  createdAt!: Date;
  steps?: StepExecutionResponseDto[];
}

export class StepExecutionResponseDto {
  id!: string;
  workflowStepId!: string;
  stepNumber!: number;
  stepType!: string;
  stepName?: string;
  status!: ExecutionStatus;
  inputData!: Record<string, unknown>;
  outputData?: Record<string, unknown> | null;
  errorMessage?: string | null;
  retryCount!: number;
  startedAt!: Date;
  completedAt?: Date | null;
}
