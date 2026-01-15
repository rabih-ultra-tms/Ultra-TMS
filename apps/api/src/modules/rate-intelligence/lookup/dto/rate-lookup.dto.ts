import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RateLookupDto {
  @ApiPropertyOptional({ description: 'Origin city' })
  @IsOptional()
  @IsString()
  originCity?: string;

  @ApiProperty({ description: 'Origin state', minLength: 2, maxLength: 3 })
  @IsString()
  @Length(2, 3)
  originState!: string;

  @ApiPropertyOptional({ description: 'Origin ZIP' })
  @IsOptional()
  @IsString()
  originZip?: string;

  @ApiPropertyOptional({ description: 'Destination city' })
  @IsOptional()
  @IsString()
  destCity?: string;

  @ApiProperty({ description: 'Destination state', minLength: 2, maxLength: 3 })
  @IsString()
  @Length(2, 3)
  destState!: string;

  @ApiPropertyOptional({ description: 'Destination ZIP' })
  @IsOptional()
  @IsString()
  destZip?: string;

  @ApiProperty({ description: 'Equipment type' })
  @IsString()
  equipmentType!: string;

  @ApiPropertyOptional({ type: [String], description: 'Provider keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providers?: string[]; // Specific providers or all
}
