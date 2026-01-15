import { AssignmentStatus, AssignmentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCustomerAssignmentDto {
  @ApiPropertyOptional({ enum: AssignmentType })
  @IsOptional()
  @IsEnum(AssignmentType)
  assignmentType?: AssignmentType;

  @ApiPropertyOptional({ enum: AssignmentStatus })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({ description: 'Protection end date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  protectionEnd?: string;

  @ApiPropertyOptional({ description: 'Split percent', minimum: 0, maximum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  splitPercent?: number;

  @ApiPropertyOptional({ description: 'Protected flag' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isProtected?: boolean;

  @ApiPropertyOptional({ description: 'Override reason' })
  @IsOptional()
  @IsString()
  overrideReason?: string;

  @ApiPropertyOptional({ description: 'Override split rate', minimum: 0, maximum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  overrideSplitRate?: number;
}