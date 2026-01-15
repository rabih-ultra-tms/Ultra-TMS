import { SafetyAlertType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiProperty({ enum: SafetyAlertType })
  @IsEnum(SafetyAlertType)
  alertType: SafetyAlertType;

  @ApiProperty({ description: 'Alert message' })
  @IsString()
  alertMessage: string;

  @ApiProperty({ description: 'Severity' })
  @IsString()
  severity: string;

  @ApiPropertyOptional({ description: 'Related entity type' })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({ description: 'Related entity ID' })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiPropertyOptional({ description: 'Trigger date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  triggerDate?: Date;
}
