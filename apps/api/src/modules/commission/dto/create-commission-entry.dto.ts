import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EntryType {
  LOAD_COMMISSION = 'LOAD_COMMISSION',
  BONUS = 'BONUS',
  ADJUSTMENT = 'ADJUSTMENT',
  DRAW = 'DRAW',
  DRAW_RECOVERY = 'DRAW_RECOVERY',
}

export class CreateCommissionEntryDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsEnum(EntryType)
  entryType!: EntryType;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  calculationBasis?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  basisAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateApplied?: number;

  @IsNumber()
  @Type(() => Number)
  commissionAmount!: number;

  @IsOptional()
  @IsBoolean()
  isSplit?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  splitPercent?: number;

  @IsOptional()
  @IsString()
  parentEntryId?: string;

  @IsDateString()
  commissionPeriod!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveCommissionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReverseCommissionDto {
  @IsString()
  reversalReason!: string;
}
