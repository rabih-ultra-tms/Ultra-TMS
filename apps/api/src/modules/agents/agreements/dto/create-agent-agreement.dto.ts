import { CommissionSplitType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateAgentAgreementDto {
  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsEnum(CommissionSplitType)
  splitType!: CommissionSplitType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  splitRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minimumPerLoad?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  protectionPeriodMonths?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sunsetEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sunsetPeriodMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  drawAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(28)
  paymentDay?: number;
}