import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateClaimItemDto {
  @ApiProperty({ description: 'Description of the claim item.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ minimum: 1, description: 'Quantity of the item claimed.' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ minimum: 0, description: 'Unit price for the item.' })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Total value for the item.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalValue?: number;

  @ApiPropertyOptional({ description: 'Type of damage reported for the item.' })
  @IsOptional()
  @IsString()
  damageType?: string;

  @ApiPropertyOptional({ description: 'Extent of damage reported for the item.' })
  @IsOptional()
  @IsString()
  damageExtent?: string;
}
