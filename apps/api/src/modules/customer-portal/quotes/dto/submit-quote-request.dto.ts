import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuoteRequestDto {
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

  @ApiProperty({ description: 'Pickup date', format: 'date-time', type: String })
  @IsDateString()
  pickupDate!: string;

  @ApiPropertyOptional({ description: 'Delivery date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({ description: 'Flexible dates flag' })
  @IsOptional()
  @IsBoolean()
  isFlexibleDates?: boolean;

  @ApiProperty({ description: 'Equipment type' })
  @IsString()
  equipmentType!: string;

  @ApiPropertyOptional({ description: 'Commodity' })
  @IsOptional()
  @IsString()
  commodity?: string;

  @ApiPropertyOptional({ description: 'Weight (lbs)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightLbs?: number;

  @ApiPropertyOptional({ description: 'Pieces count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pieces?: number;

  @ApiPropertyOptional({ description: 'Pallet count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pallets?: number;

  @ApiPropertyOptional({ description: 'Hazmat flag' })
  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional({ type: [String], description: 'Requested accessorials' })
  @IsOptional()
  @IsArray()
  requestedAccessorials?: string[];
}

export class AcceptQuoteDto {
  @ApiPropertyOptional({ description: 'Acceptance notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DeclineQuoteDto {
  @ApiPropertyOptional({ description: 'Decline reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RevisionRequestDto {
  @ApiProperty({ description: 'Revision request' })
  @IsString()
  request!: string;
}

export class EstimateQuoteDto {
  @ApiProperty({ description: 'Origin city' })
  @IsString()
  originCity!: string;

  @ApiProperty({ description: 'Destination city' })
  @IsString()
  destCity!: string;

  @ApiPropertyOptional({ description: 'Miles' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  miles?: number;

  @ApiPropertyOptional({ description: 'Equipment type' })
  @IsOptional()
  @IsString()
  equipmentType?: string;
}