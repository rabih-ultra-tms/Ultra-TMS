import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PostingType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  BOTH = 'BOTH',
}

export enum PostingVisibility {
  ALL_CARRIERS = 'ALL_CARRIERS',
  PREFERRED_ONLY = 'PREFERRED_ONLY',
  SPECIFIC_CARRIERS = 'SPECIFIC_CARRIERS',
}

export enum PostingStatus {
  ACTIVE = 'ACTIVE',
  BOOKED = 'BOOKED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum RateType {
  ALL_IN = 'ALL_IN',
  PER_MILE = 'PER_MILE',
}

export class CreateLoadPostingDto {
  @IsString()
  loadId!: string;

  @IsEnum(PostingType)
  postingType!: PostingType;

  @IsOptional()
  @IsEnum(PostingVisibility)
  visibility?: PostingVisibility;

  @IsOptional()
  @IsBoolean()
  showRate?: boolean;

  @IsOptional()
  @IsEnum(RateType)
  rateType?: RateType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  postedRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateMax?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  autoRefresh?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  refreshInterval?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  carrierIds?: string[];
}

export class UpdateLoadPostingDto {
  @IsOptional()
  @IsEnum(PostingType)
  postingType?: PostingType;

  @IsOptional()
  @IsEnum(PostingVisibility)
  visibility?: PostingVisibility;

  @IsOptional()
  @IsEnum(PostingStatus)
  status?: PostingStatus;

  @IsOptional()
  @IsBoolean()
  showRate?: boolean;

  @IsOptional()
  @IsEnum(RateType)
  rateType?: RateType;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  postedRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateMax?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  autoRefresh?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  refreshInterval?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  carrierIds?: string[];
}

export class SearchLoadPostingDto {
  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  destState?: string;

  @IsOptional()
  @IsString()
  destCity?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsDateString()
  pickupDateFrom?: string;

  @IsOptional()
  @IsDateString()
  pickupDateTo?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  radiusMiles?: number;

  @IsOptional()
  @IsEnum(PostingStatus)
  status?: PostingStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
