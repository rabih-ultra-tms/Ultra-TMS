import { IsString, IsOptional, IsNumber, IsUUID, IsArray, IsDateString, IsBoolean, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatusEnum } from './order-query.dto';

export class AccessorialChargeDto {
  @IsString()
  type!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerReference?: string;

  @IsOptional()
  @IsString()
  customerReferenceNumber?: string;

  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  bolNumber?: string;

  @IsOptional()
  @IsString()
  salesRepId?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  // Cargo fields
  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weightLbs?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pieceCount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  palletCount?: number;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  hazmatClass?: string;

  @IsOptional()
  @IsString()
  hazmatUnNumber?: string;

  @IsOptional()
  @IsString()
  hazmatPlacard?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  temperatureMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  temperatureMax?: number;

  @IsOptional()
  @IsArray()
  specialHandling?: string[];

  // Rate fields
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customerRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fuelSurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedCarrierRate?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  billingContactId?: string;

  @IsOptional()
  @IsString()
  billingNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessorialChargeDto)
  accessorials?: AccessorialChargeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops!: CreateStopDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}

export class UpdateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerReference?: string;

  @IsOptional()
  @IsString()
  customerReferenceNumber?: string;

  @IsOptional()
  @IsString()
  poNumber?: string;

  @IsOptional()
  @IsString()
  bolNumber?: string;

  @IsOptional()
  @IsString()
  salesRepId?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  commodity?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weightLbs?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pieceCount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  palletCount?: number;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  hazmatClass?: string;

  @IsOptional()
  @IsString()
  hazmatUnNumber?: string;

  @IsOptional()
  @IsString()
  hazmatPlacard?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  temperatureMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  temperatureMax?: number;

  @IsOptional()
  @IsArray()
  specialHandling?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customerRate?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fuelSurcharge?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  estimatedCarrierRate?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  billingContactId?: string;

  @IsOptional()
  @IsString()
  billingNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessorialChargeDto)
  accessorials?: AccessorialChargeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  stops?: CreateStopDto[];
}

export class CloneOrderDto {
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  overrides?: Record<string, any>;
}

export class ChangeOrderStatusDto {
  @IsEnum(OrderStatusEnum)
  status!: OrderStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelOrderDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  cancelledBy?: string;
}

export class ConvertQuoteToOrderDto {
  @IsUUID()
  quoteId!: string;
}

// Stop DTO — field names match Prisma schema
export class CreateStopDto {
  @IsString()
  stopType!: string; // PICKUP, DELIVERY

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
  @IsBoolean()
  appointmentRequired?: boolean;

  @IsOptional()
  @IsString()
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  appointmentTimeStart?: string;

  @IsOptional()
  @IsString()
  appointmentTimeEnd?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsNumber()
  stopSequence?: number;
}

export class CreateOrderItemDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  quantityType?: string; // PIECES, PALLETS, SKIDS

  @IsOptional()
  @IsNumber()
  weightLbs?: number;

  @IsOptional()
  @IsString()
  commodityClass?: string;

  @IsOptional()
  @IsString()
  nmfcCode?: string;

  @IsOptional()
  @IsBoolean()
  isHazmat?: boolean;

  @IsOptional()
  @IsString()
  hazmatClass?: string;

  @IsOptional()
  @IsString()
  unNumber?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  lotNumber?: string;
}

// Response DTOs
export class OrderDto {
  id!: string;
  tenantId!: string;
  orderNumber!: string;
  customerId!: string;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class OrderDetailDto extends OrderDto {
  stops!: StopDto[];
  loads!: LoadDto[];
  items!: OrderItemDto[];
  totalRevenue!: number;
  customerReference?: string;
  specialInstructions?: string;
  isHot!: boolean;
}

export class StopDto {
  id!: string;
  stopType!: string;
  facilityName?: string;
  addressLine1!: string;
  city!: string;
  state!: string;
  postalCode!: string;
  contactName?: string;
  contactPhone?: string;
  appointmentDate?: string;
  appointmentTimeStart?: string;
  status!: string;
  stopSequence!: number;
  arrivedAt?: Date;
  departedAt?: Date;
}

export class LoadDto {
  id!: string;
  loadNumber!: string;
  orderId!: string;
  carrierId?: string;
  status!: string;
  carrierRate?: number;
  createdAt!: Date;
}

export class OrderItemDto {
  id!: string;
  description!: string;
  quantity!: number;
  quantityType?: string;
  weightLbs?: number;
  commodityClass?: string;
  nmfcCode?: string;
  isHazmat!: boolean;
}
