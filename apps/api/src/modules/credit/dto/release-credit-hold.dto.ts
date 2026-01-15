import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReleaseCreditHoldDto {
  @ApiProperty({ description: 'Released by user ID' })
  @IsString()
  @IsNotEmpty()
  releasedById!: string;

  @ApiPropertyOptional({ description: 'Resolution notes' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
