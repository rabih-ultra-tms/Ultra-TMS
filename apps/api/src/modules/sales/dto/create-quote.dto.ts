import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteStopDto {
  @IsString()
  stopType!: string; // PICKUP, DELIVERY

  @IsNumber()
  stopSequence!: number;

  @IsOptional()
  @IsString()
  facilityName?: string;

  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsDateString()
  appointmentStart?: string;

  @IsOptional()
  @IsDateString()
  appointmentEnd?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateQuoteDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsString()
  serviceType!: string; // FTL, LTL, PARTIAL, DRAYAGE

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  @IsString()
  pickupWindowStart?: string;

  @IsOptional()
  @IsString()
  pickupWindowEnd?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryWindowStart?: string;

  @IsOptional()
  @IsString()
  deliveryWindowEnd?: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsNumber()
  weightLbs?: number;

  @IsOptional()
  @IsNumber()
  pieces?: number;

  @IsOptional()
  @IsNumber()
  pallets?: number;

  @IsOptional()
  @IsNumber()
  totalMiles?: number;

  @IsOptional()
  @IsNumber()
  linehaulRate?: number;

  @IsOptional()
  @IsNumber()
  fuelSurcharge?: number;

  @IsOptional()
  @IsNumber()
  accessorialsTotal?: number;

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsNumber()
  marginPercent?: number;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteStopDto)
  stops?: QuoteStopDto[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateQuoteDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsNumber()
  weightLbs?: number;

  @IsOptional()
  @IsNumber()
  pieces?: number;

  @IsOptional()
  @IsNumber()
  pallets?: number;

  @IsOptional()
  @IsNumber()
  totalMiles?: number;

  @IsOptional()
  @IsNumber()
  linehaulRate?: number;

  @IsOptional()
  @IsNumber()
  fuelSurcharge?: number;

  @IsOptional()
  @IsNumber()
  accessorialsTotal?: number;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  marginPercent?: number;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteStopDto)
  stops?: QuoteStopDto[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
