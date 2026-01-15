import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateStatementDto {
  @ApiPropertyOptional({ description: 'Period start', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Period end', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}