import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsBoolean, IsObject } from 'class-validator';

export class CreateLoadDto {
  @IsUUID()
  orderId!: string;

  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  truckNumber?: string;

  @IsOptional()
  @IsString()
  trailerNumber?: string;

  @IsOptional()
  @IsNumber()
  carrierRate?: number;

  @IsOptional()
  @IsNumber()
  accessorialCosts?: number;

  @IsOptional()
  @IsNumber()
  fuelAdvance?: number;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsNumber()
  equipmentLength?: number;

  @IsOptional()
  @IsNumber()
  equipmentWeightLimit?: number;

  @IsOptional()
  @IsString()
  dispatchNotes?: string;
}

export class UpdateLoadDto extends CreateLoadDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class AssignCarrierDto {
  @IsUUID()
  carrierId!: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsString()
  truckNumber?: string;

  @IsOptional()
  @IsString()
  trailerNumber?: string;

  @IsNumber()
  carrierRate!: number;
}

export class UpdateLoadLocationDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsDateString()
  eta?: string;
}
