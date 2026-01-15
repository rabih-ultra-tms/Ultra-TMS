import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertCondition } from '@prisma/client';

export class CreateRateAlertDto {
  @ApiProperty({ description: 'Alert name' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: AlertCondition })
  @IsEnum(AlertCondition)
  condition!: AlertCondition;

  @ApiPropertyOptional({ description: 'Origin market' })
  @IsOptional()
  @IsString()
  originMarket?: string;

  @ApiPropertyOptional({ description: 'Destination market' })
  @IsOptional()
  @IsString()
  destMarket?: string;

  @ApiPropertyOptional({ description: 'Equipment type' })
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({ description: 'Threshold value' })
  @IsOptional()
  @IsNumber()
  thresholdValue?: number;

  @ApiPropertyOptional({ description: 'Comparison period' })
  @IsOptional()
  @IsString()
  comparisonPeriod?: string;

  @ApiPropertyOptional({ type: [String], description: 'Notify user IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notifyUsers?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Notify emails' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  notifyEmail?: string[];
}
