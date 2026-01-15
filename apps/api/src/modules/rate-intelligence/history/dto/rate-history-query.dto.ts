import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RateHistoryQueryDto {
  @ApiProperty({ description: 'Origin market' })
  @IsString()
  originMarket!: string;

  @ApiProperty({ description: 'Destination market' })
  @IsString()
  destMarket!: string;

  @ApiProperty({ description: 'Equipment type' })
  @IsString()
  equipmentType!: string;

  @ApiProperty({ description: 'Start date', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty({ description: 'End date', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @ApiPropertyOptional({ description: 'Data source' })
  @IsOptional()
  @IsString()
  dataSource?: string;
}
