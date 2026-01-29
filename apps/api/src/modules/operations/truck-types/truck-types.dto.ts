import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTruckTypeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  deckHeightFt: number;

  @ApiProperty()
  @IsNumber()
  deckLengthFt: number;

  @ApiProperty()
  @IsNumber()
  deckWidthFt: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wellLengthFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wellHeightFt?: number;

  @ApiProperty()
  @IsNumber()
  maxCargoWeightLbs: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tareWeightLbs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLegalCargoHeightFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLegalCargoWidthFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bestFor?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loadingMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseRateCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  ratePerMileCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateTruckTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deckHeightFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deckLengthFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deckWidthFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wellLengthFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wellHeightFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxCargoWeightLbs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tareWeightLbs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLegalCargoHeightFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxLegalCargoWidthFt?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bestFor?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loadingMethod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseRateCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  ratePerMileCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
