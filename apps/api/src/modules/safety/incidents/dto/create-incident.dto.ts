import { SafetyIncidentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiPropertyOptional({ description: 'Driver ID' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Load ID' })
  @IsOptional()
  @IsString()
  loadId?: string;

  @ApiProperty({ enum: SafetyIncidentType })
  @IsEnum(SafetyIncidentType)
  incidentType: SafetyIncidentType;

  @ApiProperty({ description: 'Incident date', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  incidentDate: Date;

  @ApiProperty({ description: 'Incident description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Severity' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Out-of-service flag' })
  @IsOptional()
  @IsBoolean()
  wasOutOfService?: boolean;

  @ApiPropertyOptional({ description: 'Injuries count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  injuriesCount?: number;

  @ApiPropertyOptional({ description: 'Fatalities count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fatalitiesCount?: number;

  @ApiPropertyOptional({ description: 'Citation number' })
  @IsOptional()
  @IsString()
  citationNumber?: string;

  @ApiPropertyOptional({ type: [String], description: 'Violation codes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  violationCodes?: string[];

  @ApiPropertyOptional({ description: 'Fine amount' })
  @IsOptional()
  @IsNumber()
  fineAmount?: number;

  @ApiPropertyOptional({ description: 'CSA points' })
  @IsOptional()
  @IsNumber()
  csaPoints?: number;

  @ApiPropertyOptional({ description: 'Investigation notes' })
  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @ApiPropertyOptional({ description: 'Report URL' })
  @IsOptional()
  @IsString()
  reportUrl?: string;
}
