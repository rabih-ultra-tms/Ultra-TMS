import { AssignmentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignCustomerDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsString()
  customerId!: string;

  @ApiProperty({ enum: AssignmentType })
  @IsEnum(AssignmentType)
  assignmentType!: AssignmentType;

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

  @ApiPropertyOptional({ description: 'Source' })
  @IsOptional()
  @IsString()
  source?: string;
}