import {
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  IsDecimal,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCargoItemDto } from './cargo-item.dto';
import { CreateTruckDto } from './truck.dto';
import { CreateServiceItemDto } from './service-item.dto';
import { CreateAccessorialDto } from './accessorial.dto';
import { CreatePermitDto } from './permit.dto';

export class CreateLoadPlannerQuoteDto {
  @IsString()
  customerName: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerCompany?: string;

  @IsString()
  pickupAddress: string;

  @IsString()
  pickupCity: string;

  @IsString()
  pickupState: string;

  @IsString()
  pickupZip: string;

  @IsDecimal({ decimal_digits: '8' })
  pickupLat: number;

  @IsDecimal({ decimal_digits: '8' })
  pickupLng: number;

  @IsString()
  dropoffAddress: string;

  @IsString()
  dropoffCity: string;

  @IsString()
  dropoffState: string;

  @IsString()
  dropoffZip: string;

  @IsDecimal({ decimal_digits: '8' })
  dropoffLat: number;

  @IsDecimal({ decimal_digits: '8' })
  dropoffLng: number;

  @IsDecimal({ decimal_digits: '2' })
  distanceMiles: number;

  @IsNumber()
  @Min(0)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  routePolyline?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotalCents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCents?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCargoItemDto)
  cargoItems?: CreateCargoItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTruckDto)
  trucks?: CreateTruckDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceItemDto)
  serviceItems?: CreateServiceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAccessorialDto)
  accessorials?: CreateAccessorialDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePermitDto)
  permits?: CreatePermitDto[];
}

export class UpdateLoadPlannerQuoteDto extends CreateLoadPlannerQuoteDto {}

export class UpdateQuoteStatusDto {
  @IsString()
  status: string; // DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED
}

export class ListLoadPlannerQuotesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  pickupState?: string;

  @IsOptional()
  @IsString()
  dropoffState?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsNumber()
  @Min(1)
  page: number = 1;

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
