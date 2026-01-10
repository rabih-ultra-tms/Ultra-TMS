import { IsString, IsOptional, IsEnum, IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';
import { CarrierContactRole } from './enums';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCarrierContactDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsEnum(CarrierContactRole)
  role!: CarrierContactRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneExt?: string;

  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isDispatch?: boolean;

  @IsOptional()
  @IsBoolean()
  isAccounting?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCarrierContactDto extends PartialType(CreateCarrierContactDto) {}
