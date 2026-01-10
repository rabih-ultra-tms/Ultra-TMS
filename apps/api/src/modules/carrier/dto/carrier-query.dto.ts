import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsString, IsArray, IsBoolean } from 'class-validator';
import { PaginationDto } from '../../tms/dto/pagination.dto';
import { CarrierStatus, CarrierTier, EquipmentType } from './enums';

export class CarrierQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

  @IsOptional()
  @IsEnum(CarrierTier)
  tier?: CarrierTier;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  @Type(() => String)
  equipmentTypes?: EquipmentType[];

  @IsOptional()
  @IsBoolean()
  hasExpiredInsurance?: boolean;

  @IsOptional()
  @IsBoolean()
  hasExpiredDocuments?: boolean;
}
