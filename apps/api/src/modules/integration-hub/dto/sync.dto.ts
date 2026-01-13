import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ExecutionStatus, SyncDirection } from '@prisma/client';

export class SyncJobQueryDto {
  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  jobType?: string;

  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

export class CreateSyncJobDto {
  @IsString()
  integrationId!: string;

  @IsString()
  jobType!: string;

  @IsEnum(SyncDirection)
  direction!: SyncDirection;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;
}

export class SyncJobResponseDto {
  id!: string;
  integrationId!: string;
  jobType!: string;
  direction!: SyncDirection;
  schedule?: string | null;
  filters?: Record<string, unknown>;
  lastSyncAt?: Date | null;
  recordsProcessed?: number | null;
  recordsFailed?: number | null;
  status!: ExecutionStatus;
  lastError?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SyncJobListResponseDto {
  data!: SyncJobResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
