import { IsString, IsOptional, IsNumber, IsUUID, IsDateString, IsArray, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderStopDto {
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
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsDateString()
  appointmentStart?: string;

  @IsOptional()
  @IsDateString()
  appointmentEnd?: string;

  @IsOptional()
  @IsString()
  appointmentType?: string; // FCFS, APPOINTMENT, OPEN

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

export class OrderItemDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  packageType?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  commodityClass?: string;

  @IsOptional()
  @IsString()
  nmfcCode?: string;

  @IsOptional()
  @IsBoolean()
  hazmat?: boolean;

  @IsOptional()
  @IsString()
  hazmatClass?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  customerReference?: string;

  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  bolNumber?: string;

  @IsOptional()
  @IsString()
  orderType?: string; // FTL, LTL, PARTIAL, INTERMODAL

  @IsOptional()
  @IsString()
  mode?: string; // TRUCKLOAD, INTERMODAL, RAIL, AIR, OCEAN

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsBoolean()
  teamRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  hazmat?: boolean;

  @IsOptional()
  @IsNumber()
  totalWeight?: number;

  @IsOptional()
  @IsNumber()
  totalPieces?: number;

  @IsOptional()
  @IsNumber()
  totalMiles?: number;

  @IsOptional()
  @IsNumber()
  customerRate?: number;

  @IsOptional()
  @IsNumber()
  fuelSurcharge?: number;

  @IsOptional()
  @IsNumber()
  accessorialCharges?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderStopDto)
  stops?: OrderStopDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateOrderDto extends CreateOrderDto {
  @IsOptional()
  @IsString()
  status?: string;
}
