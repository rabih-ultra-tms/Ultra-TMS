import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsArray, IsBoolean, ValidateNested, IsObject, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class LaneRateDto {
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
  @IsIn(['PER_MILE', 'FLAT', 'PER_CWT'])
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

export class CreateRateContractDto {
  @IsString()
  name!: string;

  @IsString()
  contractNumber!: string;

  @IsUUID()
  companyId!: string;

  @IsDateString()
  effectiveDate!: string;

  @IsDateString()
  expirationDate!: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsNumber()
  renewalNoticeDays?: number;

  @IsOptional()
  @IsString()
  defaultFuelSurchargeType?: string; // DOE_NATIONAL, DOE_REGIONAL, CUSTOM

  @IsOptional()
  @IsNumber()
  defaultFuelSurchargePercent?: number;

  @IsOptional()
  @IsNumber()
  minimumMarginPercent?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LaneRateDto)
  laneRates?: LaneRateDto[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateRateContractDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contractNumber?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsNumber()
  renewalNoticeDays?: number;

  @IsOptional()
  @IsString()
  defaultFuelSurchargeType?: string;

  @IsOptional()
  @IsNumber()
  defaultFuelSurchargePercent?: number;

  @IsOptional()
  @IsNumber()
  minimumMarginPercent?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
