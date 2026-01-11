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

export class CreateIncidentDto {
  @IsString()
  carrierId: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsEnum(SafetyIncidentType)
  incidentType: SafetyIncidentType;

  @IsDate()
  @Type(() => Date)
  incidentDate: Date;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsBoolean()
  wasOutOfService?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  injuriesCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fatalitiesCount?: number;

  @IsOptional()
  @IsString()
  citationNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  violationCodes?: string[];

  @IsOptional()
  @IsNumber()
  fineAmount?: number;

  @IsOptional()
  @IsNumber()
  csaPoints?: number;

  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @IsOptional()
  @IsString()
  reportUrl?: string;
}
