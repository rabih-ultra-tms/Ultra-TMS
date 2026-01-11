import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SubmitQuoteRequestDto {
  @IsString()
  originCity: string;

  @IsString()
  originState: string;

  @IsOptional()
  @IsString()
  originZip?: string;

  @IsString()
  destCity: string;

  @IsString()
  destState: string;

  @IsOptional()
  @IsString()
  destZip?: string;

  @IsDateString()
  pickupDate: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsBoolean()
  isFlexibleDates?: boolean;

  @IsString()
  equipmentType: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weightLbs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pieces?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pallets?: number;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsArray()
  requestedAccessorials?: string[];
}

export class AcceptQuoteDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DeclineQuoteDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class RevisionRequestDto {
  @IsString()
  request: string;
}

export class EstimateQuoteDto {
  @IsString()
  originCity: string;

  @IsString()
  destCity: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  miles?: number;

  @IsOptional()
  @IsString()
  equipmentType?: string;
}