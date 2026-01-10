import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateLaneRateDto {
  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsOptional()
  @IsString()
  originZone?: string;

  @IsOptional()
  @IsNumber()
  originRadiusMiles?: number;

  @IsOptional()
  @IsString()
  destinationCity?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsString()
  destinationZip?: string;

  @IsOptional()
  @IsString()
  destinationZone?: string;

  @IsOptional()
  @IsNumber()
  destinationRadiusMiles?: number;

  @IsOptional()
  @IsString()
  serviceType?: string; // FTL, LTL, PARTIAL

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsString()
  rateType!: string; // PER_MILE, FLAT, PER_CWT

  @IsNumber()
  rateAmount!: number;

  @IsOptional()
  @IsNumber()
  minimumCharge?: number;

  @IsOptional()
  @IsBoolean()
  fuelIncluded?: boolean;

  @IsOptional()
  @IsString()
  fuelSurchargeType?: string;

  @IsOptional()
  @IsNumber()
  fuelSurchargePercent?: number;

  @IsOptional()
  @IsNumber()
  volumeMin?: number;

  @IsOptional()
  @IsNumber()
  volumeMax?: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLaneRateDto {
  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsOptional()
  @IsString()
  destinationCity?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsString()
  destinationZip?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsString()
  rateType?: string;

  @IsOptional()
  @IsNumber()
  rateAmount?: number;

  @IsOptional()
  @IsNumber()
  minimumCharge?: number;

  @IsOptional()
  @IsBoolean()
  fuelIncluded?: boolean;

  @IsOptional()
  @IsNumber()
  fuelSurchargePercent?: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
