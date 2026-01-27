import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCargoItemDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNumber()
  @Min(1)
  quantity: number = 1;

  @IsNumber()
  @Min(0)
  lengthIn: number;

  @IsNumber()
  @Min(0)
  widthIn: number;

  @IsNumber()
  @Min(0)
  heightIn: number;

  @IsNumber()
  @Min(0)
  weightLbs: number;

  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @IsOptional()
  @IsBoolean()
  bottomOnly?: boolean;

  @IsOptional()
  @IsNumber()
  maxLayers?: number;

  @IsOptional()
  @IsBoolean()
  fragile?: boolean;

  @IsOptional()
  @IsBoolean()
  hazmat?: boolean;

  @IsOptional()
  @IsString()
  orientation?: string;

  @IsOptional()
  @IsString()
  geometryType?: string;

  @IsOptional()
  geometryData?: Record<string, any>;

  @IsOptional()
  @IsString()
  equipmentMakeId?: string;

  @IsOptional()
  @IsString()
  equipmentModelId?: string;

  @IsOptional()
  @IsString()
  dimensionsSource?: string;

  @IsOptional()
  @IsString()
  imageUrl1?: string;

  @IsOptional()
  @IsString()
  imageUrl2?: string;

  @IsOptional()
  @IsString()
  imageUrl3?: string;

  @IsOptional()
  @IsString()
  imageUrl4?: string;

  @IsOptional()
  @IsNumber()
  assignedTruckIndex?: number;

  @IsOptional()
  @IsNumber()
  placementX?: number;

  @IsOptional()
  @IsNumber()
  placementY?: number;

  @IsOptional()
  @IsNumber()
  placementZ?: number;

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsNumber()
  @Min(0)
  sortOrder: number = 0;
}

export class UpdateCargoItemDto extends CreateCargoItemDto {}

export class CargoItemResponseDto {
  id: string;
  quoteId: string;
  description: string;
  sku?: string;
  quantity: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  weightLbs: number;
  stackable: boolean;
  bottomOnly: boolean;
  maxLayers?: number;
  fragile: boolean;
  hazmat: boolean;
  orientation?: string;
  geometryType?: string;
  geometryData?: Record<string, any>;
  equipmentMakeId?: string;
  equipmentModelId?: string;
  dimensionsSource?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  assignedTruckIndex?: number;
  placementX?: number;
  placementY?: number;
  placementZ?: number;
  rotation?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
