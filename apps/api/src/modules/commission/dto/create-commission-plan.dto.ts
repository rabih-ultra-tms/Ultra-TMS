import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PlanType {
  FLAT_FEE = 'FLAT_FEE',
  PERCENT_REVENUE = 'PERCENT_REVENUE',
  PERCENT_MARGIN = 'PERCENT_MARGIN',
  TIERED = 'TIERED',
  CUSTOM = 'CUSTOM',
}

export enum CalculationBasis {
  GROSS_REVENUE = 'GROSS_REVENUE',
  NET_MARGIN = 'NET_MARGIN',
  LINEHAUL = 'LINEHAUL',
}

export class CommissionPlanTierDto {
  @IsNumber()
  @Type(() => Number)
  tierNumber!: number;

  @IsOptional()
  @IsString()
  tierName?: string;

  @IsString()
  thresholdType!: string; // REVENUE, LOAD_COUNT, MARGIN

  @IsNumber()
  @Type(() => Number)
  thresholdMin!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  thresholdMax?: number;

  @IsString()
  rateType!: string; // FLAT, PERCENT

  @IsNumber()
  @Type(() => Number)
  rateAmount!: number;

  @IsOptional()
  @IsString()
  periodType?: string; // MONTHLY, QUARTERLY, ANNUAL
}

export class CreateCommissionPlanDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PlanType)
  planType!: PlanType;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  flatAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  percentRate?: number;

  @IsOptional()
  @IsEnum(CalculationBasis)
  calculationBasis?: CalculationBasis;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minimumMarginPercent?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommissionPlanTierDto)
  tiers?: CommissionPlanTierDto[];
}

export class UpdateCommissionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  flatAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  percentRate?: number;
}
