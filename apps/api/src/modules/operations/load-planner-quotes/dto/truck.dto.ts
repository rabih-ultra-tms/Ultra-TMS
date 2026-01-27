import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsEmail,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTruckDto {
  @IsOptional()
  @IsString()
  truckTypeId?: string;

  @IsString()
  truckName: string;

  @IsString()
  truckCategory: string;

  @IsDecimal({ decimal_digits: '2' })
  deckLengthFt: number;

  @IsDecimal({ decimal_digits: '2' })
  deckWidthFt: number;

  @IsDecimal({ decimal_digits: '2' })
  deckHeightFt: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  wellLengthFt?: number;

  @IsNumber()
  @Min(0)
  maxCargoWeightLbs: number;

  @IsOptional()
  @IsNumber()
  totalWeightLbs?: number;

  @IsOptional()
  @IsNumber()
  totalItems?: number;

  @IsOptional()
  @IsBoolean()
  isLegal?: boolean;

  @IsOptional()
  @IsArray()
  permitsRequired?: string[];

  @IsOptional()
  @IsArray()
  warnings?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  truckScore?: number;

  @IsNumber()
  @Min(0)
  sortOrder: number = 0;
}

export class UpdateTruckDto extends CreateTruckDto {}

export class TruckResponseDto {
  id: string;
  quoteId: string;
  truckIndex: number;
  truckTypeId?: string;
  truckName: string;
  truckCategory: string;
  deckLengthFt: number;
  deckWidthFt: number;
  deckHeightFt: number;
  wellLengthFt: number;
  maxCargoWeightLbs: number;
  totalWeightLbs: number;
  totalItems: number;
  isLegal: boolean;
  permitsRequired: string[];
  warnings: string[];
  truckScore: number;
  createdAt: Date;
  updatedAt: Date;
}
