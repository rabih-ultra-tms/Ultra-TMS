import { CSABasicType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCsaScoreDto {
  @IsString()
  carrierId: string;

  @IsEnum(CSABasicType)
  basicType: CSABasicType;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsNumber()
  percentile?: number;

  @IsOptional()
  @IsNumber()
  threshold?: number;

  @IsOptional()
  @IsBoolean()
  isAboveThreshold?: boolean;

  @IsOptional()
  @IsBoolean()
  isAlert?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inspectionCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  violationCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  oosViolationCount?: number;

  @IsOptional()
  @IsString()
  measurementPeriod?: string;

  @IsDate()
  @Type(() => Date)
  asOfDate: Date;
}
