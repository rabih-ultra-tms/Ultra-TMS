import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateSafetyScoreDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiPropertyOptional({ description: 'Force refresh flag' })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}
