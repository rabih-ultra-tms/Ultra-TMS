import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDecimal,
  Min,
} from 'class-validator';

export class CreateOperationsCarrierTruckDto {
  @IsString()
  unitNumber: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  licensePlateState?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  truckTypeId?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  customTypeDescription?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  deckLengthFt?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  deckWidthFt?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  deckHeightFt?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCargoWeightLbs?: number;

  @IsOptional()
  @IsNumber()
  axleCount?: number;

  @IsOptional()
  @IsBoolean()
  hasTarps?: boolean;

  @IsOptional()
  @IsBoolean()
  hasChains?: boolean;

  @IsOptional()
  @IsBoolean()
  hasStraps?: boolean;

  @IsOptional()
  @IsBoolean()
  coilRacks?: boolean;

  @IsOptional()
  @IsBoolean()
  loadBars?: boolean;

  @IsOptional()
  @IsBoolean()
  ramps?: boolean;

  @IsOptional()
  @IsString()
  registrationExpiry?: string; // ISO date

  @IsOptional()
  @IsString()
  annualInspectionDate?: string; // ISO date

  @IsOptional()
  @IsString()
  status?: string; // ACTIVE, INACTIVE, OUT_OF_SERVICE, SOLD

  @IsOptional()
  @IsString()
  assignedDriverId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOperationsCarrierTruckDto
  extends CreateOperationsCarrierTruckDto {}

export class OperationsCarrierTruckResponseDto {
  id: string;
  carrierId: string;
  unitNumber: string;
  vin?: string;
  licensePlate?: string;
  licensePlateState?: string;
  year?: number;
  make?: string;
  model?: string;
  truckTypeId?: string;
  category: string;
  customTypeDescription?: string;
  deckLengthFt?: number;
  deckWidthFt?: number;
  deckHeightFt?: number;
  maxCargoWeightLbs?: number;
  axleCount?: number;
  hasTarps: boolean;
  hasChains: boolean;
  hasStraps: boolean;
  coilRacks: boolean;
  loadBars: boolean;
  ramps: boolean;
  registrationExpiry?: Date;
  annualInspectionDate?: Date;
  status: string;
  assignedDriverId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
