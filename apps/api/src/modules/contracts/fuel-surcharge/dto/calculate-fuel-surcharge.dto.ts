import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateFuelSurchargeDto {
  @ApiProperty({ description: 'Fuel table ID' })
  @IsString()
  fuelTableId!: string;

  @ApiProperty({ description: 'Current fuel price' })
  @IsNumber()
  currentFuelPrice!: number;

  @ApiProperty({ description: 'Line haul amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  lineHaulAmount!: number;

  @ApiPropertyOptional({ description: 'Total miles' })
  @IsOptional()
  @IsNumber()
  miles?: number;
}
