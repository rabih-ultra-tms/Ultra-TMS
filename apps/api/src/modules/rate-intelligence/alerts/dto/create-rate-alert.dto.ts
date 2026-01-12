import { IsArray, IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AlertCondition } from '@prisma/client';

export class CreateRateAlertDto {
  @IsString()
  name!: string;

  @IsEnum(AlertCondition)
  condition!: AlertCondition;

  @IsOptional()
  @IsString()
  originMarket?: string;

  @IsOptional()
  @IsString()
  destMarket?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsNumber()
  thresholdValue?: number;

  @IsOptional()
  @IsString()
  comparisonPeriod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notifyUsers?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  notifyEmail?: string[];
}
