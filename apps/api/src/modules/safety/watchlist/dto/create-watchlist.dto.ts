import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWatchlistDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiProperty({ description: 'Watchlist reason' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Risk level' })
  @IsString()
  riskLevel: string;

  @ApiPropertyOptional({ description: 'Restricted flag' })
  @IsOptional()
  @IsBoolean()
  isRestricted?: boolean;

  @ApiPropertyOptional({ description: 'Restrictions' })
  @IsOptional()
  @IsString()
  restrictions?: string;

  @ApiPropertyOptional({ description: 'Next review date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextReviewDate?: Date;

  @ApiPropertyOptional({ description: 'Review frequency (days)' })
  @IsOptional()
  @IsNumber()
  reviewFrequencyDays?: number;
}
