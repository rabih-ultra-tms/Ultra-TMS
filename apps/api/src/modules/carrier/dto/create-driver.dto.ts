import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { CdlClass, DriverStatus } from './enums';
import { PartialType } from '@nestjs/mapped-types';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @IsString()
  @IsNotEmpty()
  licenseState!: string;

  @IsEnum(CdlClass)
  cdlClass!: CdlClass;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  endorsements?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  restrictions?: string[];

  @IsOptional()
  @IsDateString()
  licenseExpiration?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  medicalCardExpiration?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) {
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
