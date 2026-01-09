import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTERED = 'COUNTERED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum BidRateType {
  ALL_IN = 'ALL_IN',
  PER_MILE = 'PER_MILE',
}

export class CreateLoadBidDto {
  @IsString()
  postingId!: string;

  @IsString()
  loadId!: string;

  @IsString()
  carrierId!: string;

  @IsNumber()
  @Type(() => Number)
  bidAmount!: number;

  @IsOptional()
  @IsEnum(BidRateType)
  rateType?: BidRateType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  truckNumber?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateLoadBidDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bidAmount?: number;

  @IsOptional()
  @IsEnum(BidRateType)
  rateType?: BidRateType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  truckNumber?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;

  @IsOptional()
  @IsEnum(BidStatus)
  status?: BidStatus;
}

export class AcceptBidDto {
  @IsOptional()
  @IsString()
  acceptanceNotes?: string;
}

export class RejectBidDto {
  @IsString()
  rejectionReason!: string;
}

export class CounterBidDto {
  @IsNumber()
  @Type(() => Number)
  counterAmount!: number;

  @IsOptional()
  @IsString()
  counterNotes?: string;
}
