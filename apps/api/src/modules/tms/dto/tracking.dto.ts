import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum TrackingFilterStatus {
  IN_TRANSIT = 'IN_TRANSIT',
  AT_PICKUP = 'AT_PICKUP',
  AT_DELIVERY = 'AT_DELIVERY',
  DELIVERED = 'DELIVERED',
}

export class TrackingMapFilterDto {
  @IsOptional()
  @IsArray()
  @IsEnum(TrackingFilterStatus, { each: true })
  status?: TrackingFilterStatus[];

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class LocationHistoryQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  limit?: number = 100;
}

export class TrackingPointDto {
  loadId: string;
  loadNumber: string;
  status: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  eta?: Date;
  carrier?: {
    id: string;
    name: string;
  };
  nextStop?: {
    type: string;
    city: string;
    state: string;
  };
}

export class LocationHistoryDto {
  timestamp: Date;
  latitude: number;
  longitude: number;
  eventType?: string;
  notes?: string;
}
