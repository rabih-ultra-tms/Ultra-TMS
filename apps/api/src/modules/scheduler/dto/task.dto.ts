import { IsDateString, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class ScheduleTaskDto {
  @IsString()
  taskType!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsObject()
  payload!: Record<string, any>;

  @IsString()
  handler!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(3600)
  timeoutSeconds?: number;
}
