import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDecimal,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoadHistoryDto {
  @IsOptional()
  @IsString()
  loadPlannerQuoteId?: string;

  @IsOptional()
  @IsString()
  inlandQuoteId?: string;

  @IsOptional()
  @IsString()
  quoteNumber?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerCompany?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  truckId?: string;

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
  destinationCity?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsString()
  destinationZip?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalMiles?: number;

  @IsOptional()
  @IsString()
  cargoDescription?: string;

  @IsOptional()
  @IsNumber()
  pieces?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalLengthIn?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalWidthIn?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalHeightIn?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  totalWeightLbs?: number;

  @IsOptional()
  @IsBoolean()
  isOversize?: boolean;

  @IsOptional()
  @IsBoolean()
  isOverweight?: boolean;

  @IsOptional()
  @IsString()
  equipmentTypeUsed?: string;

  @IsNumber()
  @Min(0)
  customerRateCents: number;

  @IsNumber()
  @Min(0)
  carrierRateCents: number;

  @IsOptional()
  @IsString()
  quoteDate?: string; // ISO date

  @IsOptional()
  @IsString()
  bookedDate?: string; // ISO date

  @IsOptional()
  @IsString()
  pickupDate?: string; // ISO date

  @IsOptional()
  @IsString()
  deliveryDate?: string; // ISO date

  @IsOptional()
  @IsString()
  invoiceDate?: string; // ISO date

  @IsOptional()
  @IsString()
  paidDate?: string; // ISO date

  @IsOptional()
  @IsString()
  status?: string; // BOOKED, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLoadHistoryDto extends CreateLoadHistoryDto {}

export class ListLoadHistoryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(10)
  limit: number = 25;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class LoadHistoryResponseDto {
  id: string;
  tenantId: string;
  loadPlannerQuoteId?: string;
  inlandQuoteId?: string;
  quoteNumber?: string;
  customerName?: string;
  customerCompany?: string;
  carrierId?: string;
  driverId?: string;
  truckId?: string;
  originCity?: string;
  originState?: string;
  originZip?: string;
  destinationCity?: string;
  destinationState?: string;
  destinationZip?: string;
  totalMiles?: number;
  cargoDescription?: string;
  pieces?: number;
  totalLengthIn?: number;
  totalWidthIn?: number;
  totalHeightIn?: number;
  totalWeightLbs?: number;
  isOversize: boolean;
  isOverweight: boolean;
  equipmentTypeUsed?: string;
  customerRateCents: number;
  carrierRateCents: number;
  marginCents: number;
  marginPercentage: number;
  ratePerMileCustomerCents: number;
  ratePerMileCarrierCents: number;
  quoteDate?: Date;
  bookedDate?: Date;
  pickupDate?: Date;
  deliveryDate?: Date;
  invoiceDate?: Date;
  paidDate?: Date;
  status: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
