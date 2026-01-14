import { AuditSeverityLevel } from '@prisma/client';
import { IsArray, IsBoolean, IsBooleanString, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAuditAlertDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsEnum(AuditSeverityLevel)
  severity!: AuditSeverityLevel;

  @IsOptional()
  @IsArray()
  notifyUsers?: string[];

  @IsOptional()
  @IsArray()
  actions?: Array<{ type: string; config: Record<string, unknown> }>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAuditAlertDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(AuditSeverityLevel)
  severity?: AuditSeverityLevel;

  @IsOptional()
  @IsArray()
  notifyUsers?: string[];

  @IsOptional()
  @IsArray()
  actions?: Array<{ type: string; config: Record<string, unknown> }>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class IncidentQueryDto {
  @IsOptional()
  @IsEnum(AuditSeverityLevel)
  severity?: AuditSeverityLevel;

  @IsOptional()
  @IsBooleanString()
  resolved?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
