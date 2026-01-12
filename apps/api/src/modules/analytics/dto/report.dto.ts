import { IsBoolean, IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ExecutionStatus, OutputFormat, ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportType)
  reportType!: ReportType;

  @IsString()
  sourceQuery!: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  scheduleExpression?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ReportType)
  reportType?: ReportType;

  @IsOptional()
  @IsString()
  sourceQuery?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  scheduleExpression?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateScheduleDto {
  @IsBoolean()
  isScheduled!: boolean;

  @IsOptional()
  @IsString()
  scheduleExpression?: string;
}

export class ExecuteReportDto {
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  filtersUsed?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;
}

export class ExecutionQueryDto {
  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
