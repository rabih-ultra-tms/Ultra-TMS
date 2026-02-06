import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetModelsQueryDto {
  @ApiPropertyOptional({ description: 'Equipment make ID (UUID)' })
  @IsString()
  @IsUUID()
  makeId!: string;
}

export class GetModelsWithAvailabilityQueryDto {
  @ApiPropertyOptional({ description: 'Equipment make ID (UUID)' })
  @IsString()
  @IsUUID()
  makeId!: string;

  @ApiPropertyOptional({ description: 'Location filter' })
  @IsOptional()
  @IsString()
  location?: string;
}

export class GetDimensionsQueryDto {
  @ApiPropertyOptional({ description: 'Equipment model ID (UUID)' })
  @IsString()
  @IsUUID()
  modelId!: string;
}

export class GetRatesQueryDto {
  @ApiPropertyOptional({ description: 'Equipment model ID (UUID)' })
  @IsString()
  @IsUUID()
  modelId!: string;

  @ApiPropertyOptional({ description: 'Location filter' })
  @IsString()
  location!: string;
}

export class SearchEquipmentQueryDto {
  @ApiPropertyOptional({ description: 'Search query string' })
  @IsString()
  query!: string;
}

export class UpdateEquipmentImagesDto {
  @ApiPropertyOptional({ description: 'Equipment model ID (UUID)' })
  @IsString()
  @IsUUID()
  modelId!: string;

  @ApiPropertyOptional({ description: 'Front image URL' })
  @IsOptional()
  @IsString()
  frontImageUrl?: string | null;

  @ApiPropertyOptional({ description: 'Side image URL' })
  @IsOptional()
  @IsString()
  sideImageUrl?: string | null;
}
