import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserCommissionAssignmentDto {
  @IsString()
  userId!: string;

  @IsString()
  planId!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overrideRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overrideFlat?: number;

  @IsDateString()
  effectiveDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  drawAmount?: number;

  @IsOptional()
  @IsBoolean()
  drawRecoverable?: boolean;
}

export class UpdateUserCommissionAssignmentDto {
  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overrideRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overrideFlat?: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  drawAmount?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
