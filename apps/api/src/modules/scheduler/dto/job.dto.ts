import { IsBoolean, IsDateString, IsIn, IsInt, IsObject, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class CreateJobDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['SYSTEM', 'TENANT', 'USER'])
  jobType?: string;

  @IsIn(['CRON', 'INTERVAL', 'ONCE', 'MANUAL'])
  scheduleType!: string;

  @IsOptional()
  @IsString()
  @ValidateIf(o => o.scheduleType === 'CRON')
  cronExpression?: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @ValidateIf(o => o.scheduleType === 'INTERVAL')
  intervalSeconds?: number;

  @IsOptional()
  @IsDateString()
  @ValidateIf(o => o.scheduleType === 'ONCE')
  runAt?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsString()
  handler!: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(3600)
  timeoutSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3600)
  retryDelaySeconds?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsString()
  queue?: string;

  @IsOptional()
  @IsBoolean()
  allowConcurrent?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxInstances?: number;
}

export class UpdateJobDto extends CreateJobDto {}
