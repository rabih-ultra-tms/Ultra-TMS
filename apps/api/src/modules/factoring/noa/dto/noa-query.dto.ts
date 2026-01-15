import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NoaStatus } from '../../dto/enums';

export class NoaQueryDto {
  @ApiPropertyOptional({ enum: NoaStatus })
  @IsOptional()
  @IsEnum(NoaStatus)
  status?: NoaStatus;

  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Factoring company ID' })
  @IsOptional()
  @IsString()
  factoringCompanyId?: string;

  @ApiPropertyOptional({ description: 'Effective from', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Effective to', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
