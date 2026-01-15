import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StartSunsetDto {
  @ApiPropertyOptional({ description: 'Sunset start date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}