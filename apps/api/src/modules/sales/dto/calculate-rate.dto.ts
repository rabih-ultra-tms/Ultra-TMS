import { IsString, IsOptional, IsNumber, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StopLocationDto {
  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class CalculateRateDto {
  @IsString()
  serviceType!: string; // FTL, LTL, PARTIAL

  @IsString()
  equipmentType!: string; // DRY_VAN, REEFER, FLATBED

  @ValidateNested()
  @Type(() => StopLocationDto)
  origin!: StopLocationDto;

  @ValidateNested()
  @Type(() => StopLocationDto)
  destination!: StopLocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopLocationDto)
  additionalStops?: StopLocationDto[];

  @IsOptional()
  @IsNumber()
  weightLbs?: number;

  @IsOptional()
  @IsNumber()
  pieces?: number;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
