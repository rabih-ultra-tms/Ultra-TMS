import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFuelTableDto {
  @ApiProperty({ description: 'Fuel table name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Fuel table description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Base fuel price' })
  @IsNumber()
  basePrice!: number;

  @ApiPropertyOptional({ description: 'Default table flag' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ description: 'Effective date', format: 'date-time', type: String })
  @IsDateString()
  effectiveDate!: string;

  @ApiPropertyOptional({ description: 'Expiration date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Contract ID' })
  @IsOptional()
  @IsString()
  contractId?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;
}
