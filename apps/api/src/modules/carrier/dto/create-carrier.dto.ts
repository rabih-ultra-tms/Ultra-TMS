import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEmail,
  IsArray,
  IsEnum,
  IsUrl,
  IsNotEmpty,
  ValidateNested,
  Min,
  IsInt,
  IsObject,
} from 'class-validator';
import {
  CarrierStatus,
  CarrierTier,
  CarrierContactRole,
  PaymentTerms,
  PaymentMethod,
  EquipmentType,
  InsuranceType,
} from './enums';
import { CreateCarrierContactDto } from './create-contact.dto';
import { CreateInsuranceDto } from './create-insurance.dto';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCarrierDto {
  @IsString()
  @IsNotEmpty()
  dotNumber!: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsString()
  @IsNotEmpty()
  address1!: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  equipmentTypes?: EquipmentType[];

  @IsOptional()
  @IsInt()
  tractorCount?: number;

  @IsOptional()
  @IsInt()
  trailerCount?: number;

  @IsOptional()
  @IsInt()
  driverCount?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateCarrierContactDto)
  contacts?: CreateCarrierContactDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateInsuranceDto)
  insurance?: CreateInsuranceDto[];

  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

  @IsOptional()
  @IsEnum(CarrierTier)
  tier?: CarrierTier;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quickpayPercent?: number;

  @IsOptional()
  @IsBoolean()
  w9OnFile?: boolean;

  @IsOptional()
  @IsString()
  primaryContactName?: string;

  @IsOptional()
  @IsString()
  primaryContactPhone?: string;

  @IsOptional()
  @IsEmail()
  primaryContactEmail?: string;

  @IsOptional()
  @IsString()
  dispatchPhone?: string;

  @IsOptional()
  @IsEmail()
  dispatchEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceStates?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateCarrierDto extends PartialType(CreateCarrierDto) {
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

  @IsOptional()
  @IsEnum(CarrierTier)
  tier?: CarrierTier;
}
