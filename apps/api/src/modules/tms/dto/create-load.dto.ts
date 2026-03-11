import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { LoadStatusEnum } from './load-query.dto';

export class CreateLoadDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

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

export class UpdateLoadDto extends PartialType(CreateLoadDto) {
  @IsOptional()
  @IsEnum(LoadStatusEnum)
  status?: LoadStatusEnum;
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

export class TenderLoadDto {
  @IsUUID()
  carrierId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  rate?: number;
}

export class RejectTenderDto {
  @IsOptional()
  @IsString()
  reason?: string;
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
