import { CSABasicType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCsaScoreDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiProperty({ enum: CSABasicType })
  @IsEnum(CSABasicType)
  basicType: CSABasicType;

  @ApiPropertyOptional({ description: 'Score' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: 'Percentile' })
  @IsOptional()
  @IsNumber()
  percentile?: number;

  @ApiPropertyOptional({ description: 'Threshold' })
  @IsOptional()
  @IsNumber()
  threshold?: number;

  @ApiPropertyOptional({ description: 'Above threshold flag' })
  @IsOptional()
  @IsBoolean()
  isAboveThreshold?: boolean;

  @ApiPropertyOptional({ description: 'Alert flag' })
  @IsOptional()
  @IsBoolean()
  isAlert?: boolean;

  @ApiPropertyOptional({ description: 'Inspection count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  inspectionCount?: number;

  @ApiPropertyOptional({ description: 'Violation count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  violationCount?: number;

  @ApiPropertyOptional({ description: 'OOS violation count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  oosViolationCount?: number;

  @ApiPropertyOptional({ description: 'Measurement period' })
  @IsOptional()
  @IsString()
  measurementPeriod?: string;

  @ApiProperty({ description: 'As-of date', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  asOfDate: Date;
}
