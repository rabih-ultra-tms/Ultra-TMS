import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsObject,
} from 'class-validator';

export enum KpiCategory {
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  CARRIER = 'CARRIER',
  CUSTOMER = 'CUSTOMER',
  SALES = 'SALES',
}

export enum AggregationType {
  SUM = 'SUM',
  AVG = 'AVG',
  COUNT = 'COUNT',
  MIN = 'MIN',
  MAX = 'MAX',
  RATIO = 'RATIO',
}

export enum ThresholdDirection {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
}

export enum KpiStatus {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum PeriodType {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export class CreateKpiDefinitionDto {
  @IsString()
  @MaxLength(50)
  code!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(KpiCategory)
  category!: KpiCategory;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsString()
  @MaxLength(100)
  dataSource!: string;

  @IsEnum(AggregationType)
  aggregationType!: AggregationType;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  formatPattern?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  decimalPlaces?: number;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number;

  @IsOptional()
  @IsNumber()
  criticalThreshold?: number;

  @IsOptional()
  @IsEnum(ThresholdDirection)
  thresholdDirection?: ThresholdDirection;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateKpiDefinitionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  formatPattern?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  decimalPlaces?: number;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsNumber()
  warningThreshold?: number;

  @IsOptional()
  @IsNumber()
  criticalThreshold?: number;

  @IsOptional()
  @IsEnum(ThresholdDirection)
  thresholdDirection?: ThresholdDirection;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class GetKpiValuesDto {
  @IsEnum(PeriodType)
  periodType!: PeriodType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}

export class KpiBreakdownDto {
  @IsEnum(PeriodType)
  periodType!: PeriodType;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  groupBy?: string; // rep, region, customer, mode, etc.
}

export class CalculateKpiDto {
  @IsEnum(PeriodType)
  periodType!: PeriodType;

  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}
