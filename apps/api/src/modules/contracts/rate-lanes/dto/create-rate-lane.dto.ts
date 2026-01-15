import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RateType } from '@prisma/client';

export class CreateRateLaneDto {
  @ApiProperty({ description: 'Origin city' })
  @IsString()
  originCity!: string;

  @ApiProperty({ description: 'Origin state' })
  @IsString()
  originState!: string;

  @ApiPropertyOptional({ description: 'Origin ZIP' })
  @IsOptional()
  @IsString()
  originZip?: string;

  @ApiProperty({ description: 'Destination city' })
  @IsString()
  destCity!: string;

  @ApiProperty({ description: 'Destination state' })
  @IsString()
  destState!: string;

  @ApiPropertyOptional({ description: 'Destination ZIP' })
  @IsOptional()
  @IsString()
  destZip?: string;

  @ApiProperty({ description: 'Equipment type' })
  @IsString()
  equipmentType!: string;

  @ApiProperty({ enum: RateType })
  @IsEnum(RateType)
  rateType!: RateType;

  @ApiProperty({ description: 'Rate amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  rateAmount!: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Fuel surcharge table ID' })
  @IsOptional()
  @IsString()
  fuelSurchargeTableId?: string;
}
