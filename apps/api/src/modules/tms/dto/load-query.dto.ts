import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export enum LoadStatusEnum {
  PENDING = 'PENDING',
  TENDERED = 'TENDERED',
  ACCEPTED = 'ACCEPTED',
  DISPATCHED = 'DISPATCHED',
  AT_PICKUP = 'AT_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  AT_DELIVERY = 'AT_DELIVERY',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class LoadQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(LoadStatusEnum)
  status?: LoadStatusEnum;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  dispatcherId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;
}
