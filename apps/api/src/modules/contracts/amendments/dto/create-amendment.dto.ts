import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAmendmentDto {
  @ApiProperty({ description: 'Effective date', format: 'date-time', type: String })
  @IsDateString()
  effectiveDate!: string;

  @ApiPropertyOptional({ description: 'Amendment description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Changed field names' })
  @IsOptional()
  @IsArray()
  changedFields?: string[];

  @ApiPropertyOptional({ type: Object, description: 'Change payload' })
  @IsOptional()
  changes?: Record<string, unknown>;
}
