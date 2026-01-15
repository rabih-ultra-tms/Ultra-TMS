import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class EnrollQuickPayDto {
  @ApiProperty({ minimum: 0, maximum: 0.1, description: 'Quick pay fee percentage (0 - 0.1).' })
  @IsNumber()
  @Min(0)
  @Max(0.1)
  quickPayFeePercent: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 0.1, description: 'Maximum quick pay fee percentage cap.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  quickPayFeePercentMax?: number;
}
