import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitBidDto {
  @ApiProperty({ description: 'Bid amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  bidAmount!: number;

  @ApiPropertyOptional({ description: 'Bid notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Driver ID' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ description: 'Equipment ID' })
  @IsOptional()
  @IsString()
  equipmentId?: string;
}