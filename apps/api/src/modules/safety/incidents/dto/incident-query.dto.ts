import { SafetyIncidentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class IncidentQueryDto {
  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsEnum(SafetyIncidentType)
  incidentType?: SafetyIncidentType;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  driverId?: string;
}
