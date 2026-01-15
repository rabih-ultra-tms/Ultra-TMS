import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVolumeCommitmentDto {
  @ApiProperty({ description: 'Period start', format: 'date-time', type: String })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ description: 'Period end', format: 'date-time', type: String })
  @IsDateString()
  periodEnd!: string;

  @ApiPropertyOptional({ description: 'Minimum loads', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumLoads?: number;

  @ApiPropertyOptional({ description: 'Minimum revenue', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumRevenue?: number;

  @ApiPropertyOptional({ description: 'Minimum weight', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumWeight?: number;

  @ApiPropertyOptional({ description: 'Shortfall fee' })
  @IsOptional()
  @IsNumber()
  shortfallFee?: number;

  @ApiPropertyOptional({ description: 'Shortfall percent' })
  @IsOptional()
  @IsNumber()
  shortfallPercent?: number;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;
}
