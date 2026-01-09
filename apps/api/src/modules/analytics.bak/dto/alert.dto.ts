import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDateString,
  MaxLength,
  IsObject,
} from 'class-validator';

export enum AlertType {
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  REPORT = 'REPORT',
  KPI_LIST = 'KPI_LIST',
}

export class AcknowledgeAlertDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ResolveAlertDto {
  @IsString()
  resolutionNotes!: string;
}

export class CreateSavedViewDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEnum(ViewType)
  viewType!: ViewType;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  columns?: string[];

  @IsOptional()
  @IsObject()
  sortConfig?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateSavedViewDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  columns?: string[];

  @IsOptional()
  @IsObject()
  sortConfig?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class QueryDataDto {
  @IsString()
  dataSource!: string;

  @IsOptional()
  @IsArray()
  dimensions?: string[];

  @IsOptional()
  @IsArray()
  measures?: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  groupBy?: string;

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  limit?: number;
}

export class ExportDataDto {
  @IsString()
  dataSource!: string;

  @IsOptional()
  @IsArray()
  columns?: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(['CSV', 'EXCEL', 'PDF'])
  format!: 'CSV' | 'EXCEL' | 'PDF';
}

export class ComparePeriodDto {
  @IsString()
  kpiCode!: string;

  @IsEnum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'])
  periodType!: string;

  @IsDateString()
  period1Start!: string;

  @IsDateString()
  period1End!: string;

  @IsDateString()
  period2Start!: string;

  @IsDateString()
  period2End!: string;

  @IsOptional()
  @IsString()
  groupBy?: string;
}

export class TrendQueryDto {
  @IsEnum(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'])
  periodType!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
