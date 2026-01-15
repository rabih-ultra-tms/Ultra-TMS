import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFuelTierDto {
  @ApiProperty({ description: 'Tier number' })
  @IsInt()
  tierNumber!: number;

  @ApiProperty({ description: 'Minimum price' })
  @IsNumber()
  priceMin!: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsNumber()
  priceMax?: number;

  @ApiProperty({ description: 'Surcharge percent' })
  @IsNumber()
  surchargePercent!: number;
}
