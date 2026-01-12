import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { AggregationType, KPICategory, TrendDirection } from '@prisma/client';

export class CreateKpiDto {
  @IsString()
  @MaxLength(100)
  code!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(KPICategory)
  category!: KPICategory;

  @IsEnum(AggregationType)
  aggregationType!: AggregationType;

  @IsString()
  sourceQuery!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  warningValue?: number;

  @IsOptional()
  @IsNumber()
  criticalValue?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateKpiDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AggregationType)
  aggregationType?: AggregationType;

  @IsOptional()
  @IsString()
  sourceQuery?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  warningValue?: number;

  @IsOptional()
  @IsNumber()
  criticalValue?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class KpiValuesQueryDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export class CalculateKpiDto {
  @IsOptional()
  @IsDateString()
  snapshotDate?: string;
}

export class KpiTrendQueryDto {
  @IsOptional()
  @IsEnum(TrendDirection)
  trendDirection?: TrendDirection;
}
