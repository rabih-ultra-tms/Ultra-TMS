import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExecutionStatus, WorkflowExecutionStatus } from './workflow.dto';

export class ExecutionQueryDto {
  @ApiPropertyOptional({ description: 'Workflow ID' })
  @IsOptional()
  @IsString()
  workflowId?: string;

  @ApiPropertyOptional({ enum: WorkflowExecutionStatus })
  @IsOptional()
  @IsEnum(WorkflowExecutionStatus)
  status?: WorkflowExecutionStatus;

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

export class CancelExecutionDto {
  @ApiPropertyOptional({ description: 'Cancellation reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RetryExecutionDto {
  @ApiPropertyOptional({ description: 'Restart from step number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  fromStepNumber?: number;
}

export class StepExecutionResponseDto {
  @ApiProperty({ description: 'Step execution ID' })
  id!: string;
  @ApiProperty({ description: 'Workflow step ID' })
  workflowStepId!: string;
  @ApiProperty({ description: 'Step number' })
  stepNumber!: number;
  @ApiProperty({ description: 'Step type' })
  stepType!: string;
  @ApiPropertyOptional({ description: 'Step name' })
  stepName?: string;
  @ApiProperty({ enum: ExecutionStatus })
  status!: ExecutionStatus;
  @ApiProperty({ type: Object, description: 'Input data' })
  inputData!: Record<string, unknown>;
  @ApiPropertyOptional({ type: Object, description: 'Output data' })
  outputData?: Record<string, unknown> | null;
  @ApiPropertyOptional({ description: 'Error message' })
  errorMessage?: string | null;
  @ApiProperty({ description: 'Retry count' })
  retryCount!: number;
  @ApiProperty({ type: String, format: 'date-time', description: 'Started at' })
  startedAt!: Date;
  @ApiPropertyOptional({ type: String, format: 'date-time', description: 'Completed at' })
  completedAt?: Date | null;
}

export class ExecutionResponseDto {
  @ApiProperty({ description: 'Execution ID' })
  id!: string;
  @ApiProperty({ description: 'Workflow ID' })
  workflowId!: string;
  @ApiProperty({ enum: WorkflowExecutionStatus })
  status!: WorkflowExecutionStatus;
  @ApiProperty({ type: Object, description: 'Trigger data' })
  triggerData!: Record<string, unknown>;
  @ApiPropertyOptional({ type: String, format: 'date-time', description: 'Started at' })
  startedAt?: Date | null;
  @ApiPropertyOptional({ type: String, format: 'date-time', description: 'Completed at' })
  completedAt?: Date | null;
  @ApiPropertyOptional({ type: Object, description: 'Execution result' })
  result?: Record<string, unknown> | null;
  @ApiPropertyOptional({ description: 'Error message' })
  errorMessage?: string | null;
  @ApiProperty({ type: String, format: 'date-time', description: 'Created at' })
  createdAt!: Date;
  @ApiPropertyOptional({ type: [StepExecutionResponseDto] })
  steps?: StepExecutionResponseDto[];
}

export class ExecutionListResponseDto {
  @ApiProperty({ type: [ExecutionResponseDto] })
  data!: ExecutionResponseDto[];
  @ApiProperty({ description: 'Total executions' })
  total!: number;
  @ApiProperty({ description: 'Page number' })
  page!: number;
  @ApiProperty({ description: 'Page size' })
  limit!: number;
  @ApiProperty({ description: 'Total pages' })
  totalPages!: number;
}
