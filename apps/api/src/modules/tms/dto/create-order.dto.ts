import { IsString, IsOptional, IsNumber, IsUUID, IsArray, IsDateString, IsBoolean, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatusEnum } from './order-query.dto';

export class CreateOrderDto {
  @IsUUID()
  customerId!: string;

  @IsOptional()
  @IsString()
  customerReference?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

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
  @IsString()
  customerReference?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isHot?: boolean;
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

export class CreateStopDto {
  @IsString()
  stopType!: string; // PICKUP, DELIVERY

  @IsString()
  companyName!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  zip!: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  appointmentTime?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

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
  companyName!: string;
  address!: string;
  city!: string;
  state!: string;
  zip!: string;
  contactName?: string;
  phone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
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
