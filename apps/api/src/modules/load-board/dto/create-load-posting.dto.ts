import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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

export class GeoSearchDto {
  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State code (2-letter)' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP code' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Search radius in miles', default: 50, minimum: 1, maximum: 500 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  radiusMiles?: number = 50;
}

export class SearchLoadPostingDto {
  @ApiPropertyOptional({ description: 'Origin location search criteria' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoSearchDto)
  origin?: GeoSearchDto;

  @ApiPropertyOptional({ description: 'Destination location search criteria' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeoSearchDto)
  destination?: GeoSearchDto;

  @ApiPropertyOptional({ description: 'Origin state (legacy, use origin.state)' })
  @IsOptional()
  @IsString()
  originState?: string;

  @ApiPropertyOptional({ description: 'Origin city (legacy, use origin.city)' })
  @IsOptional()
  @IsString()
  originCity?: string;

  @ApiPropertyOptional({ description: 'Destination state (legacy, use destination.state)' })
  @IsOptional()
  @IsString()
  destState?: string;

  @ApiPropertyOptional({ description: 'Destination city (legacy, use destination.city)' })
  @IsOptional()
  @IsString()
  destCity?: string;

  @ApiPropertyOptional({ description: 'Search radius in miles (legacy, use origin.radiusMiles)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  radiusMiles?: number;

  @ApiPropertyOptional({ description: 'Equipment type filter' })
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({ description: 'Pickup date from' })
  @IsOptional()
  @IsDateString()
  pickupDateFrom?: string;

  @ApiPropertyOptional({ description: 'Pickup date to' })
  @IsOptional()
  @IsDateString()
  pickupDateTo?: string;

  @ApiPropertyOptional({ enum: PostingStatus, description: 'Posting status' })
  @IsOptional()
  @IsEnum(PostingStatus)
  status?: PostingStatus;

  @ApiPropertyOptional({ description: 'Minimum rate' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minRate?: number;

  @ApiPropertyOptional({ description: 'Maximum rate' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxRate?: number;

  @ApiPropertyOptional({ description: 'Include distance in results', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDistance?: boolean;

  @ApiPropertyOptional({ description: 'Sort by distance', default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sortByDistance?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
