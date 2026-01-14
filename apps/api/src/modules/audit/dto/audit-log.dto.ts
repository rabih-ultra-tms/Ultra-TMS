import { AuditAction, AuditActionCategory, AuditSeverity } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryAuditLogsDto {
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditActionCategory)
  category?: AuditActionCategory;

  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class ExportAuditLogsDto extends QueryAuditLogsDto {
  @IsIn(['CSV', 'JSON'])
  format!: string;

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean;
}

export class VerifyAuditChainDto {
  @IsOptional()
  @IsString()
  startId?: string;

  @IsOptional()
  @IsString()
  endId?: string;
}
