import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CloseIncidentDto {
  @ApiPropertyOptional({ description: 'Investigation notes' })
  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @ApiPropertyOptional({ description: 'Report URL' })
  @IsOptional()
  @IsString()
  reportUrl?: string;

  @ApiPropertyOptional({ description: 'Resolution notes' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
