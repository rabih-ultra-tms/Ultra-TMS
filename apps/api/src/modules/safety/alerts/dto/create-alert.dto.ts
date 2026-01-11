import { SafetyAlertType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  carrierId: string;

  @IsEnum(SafetyAlertType)
  alertType: SafetyAlertType;

  @IsString()
  alertMessage: string;

  @IsString()
  severity: string;

  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  triggerDate?: Date;
}
