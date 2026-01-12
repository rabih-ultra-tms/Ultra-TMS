import { IsArray, IsDateString, IsObject, IsOptional, IsString } from 'class-validator';

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
}

export class ExportDataDto extends QueryDataDto {
  @IsOptional()
  @IsString()
  format?: string;
}

export class ComparePeriodDto {
  @IsDateString()
  currentStart!: string;

  @IsDateString()
  currentEnd!: string;

  @IsDateString()
  previousStart!: string;

  @IsDateString()
  previousEnd!: string;
}

export class TrendQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class SavedViewDto {
  @IsString()
  viewName!: string;

  @IsString()
  entityType!: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  columns?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  sortOrder?: Record<string, unknown>;

  @IsOptional()
  isPublic?: boolean;
}
