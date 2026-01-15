import { SafetyIncidentType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class IncidentQueryDto {
  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ enum: SafetyIncidentType })
  @IsOptional()
  @IsEnum(SafetyIncidentType)
  incidentType?: SafetyIncidentType;

  @ApiPropertyOptional({ description: 'Severity' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ description: 'Driver ID' })
  @IsOptional()
  @IsString()
  driverId?: string;
}
