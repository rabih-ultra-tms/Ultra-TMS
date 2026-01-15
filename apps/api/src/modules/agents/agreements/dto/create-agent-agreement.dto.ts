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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgentAgreementDto {
  @ApiProperty({ description: 'Effective date', format: 'date-time', type: String })
  @IsDateString()
  effectiveDate!: string;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({ enum: CommissionSplitType })
  @IsEnum(CommissionSplitType)
  splitType!: CommissionSplitType;

  @ApiPropertyOptional({ description: 'Split rate', minimum: 0, maximum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  splitRate?: number;

  @ApiPropertyOptional({ description: 'Minimum per load' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minimumPerLoad?: number;

  @ApiPropertyOptional({ description: 'Protection period (months)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  protectionPeriodMonths?: number;

  @ApiPropertyOptional({ description: 'Sunset enabled flag' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sunsetEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Sunset period (months)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sunsetPeriodMonths?: number;

  @ApiPropertyOptional({ description: 'Draw amount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  drawAmount?: number;

  @ApiPropertyOptional({ description: 'Payment day', minimum: 1, maximum: 28 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(28)
  paymentDay?: number;
}