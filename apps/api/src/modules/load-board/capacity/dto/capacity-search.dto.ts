import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsOptional, IsString } from 'class-validator';

export class CapacitySearchDto {
  @IsString()
  accountId!: string;

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  originRadiusMiles?: number;

  @IsOptional()
  @IsString()
  destinationCity?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  destinationRadiusMiles?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableDateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  availableDateTo?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipmentTypes?: string[];

  @IsOptional()
  @IsString()
  relatedLoadId?: string;
}
