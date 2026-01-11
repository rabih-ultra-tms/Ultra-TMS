import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { CarrierPortalUserRole } from '../types';

export class InviteCarrierPortalUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(CarrierPortalUserRole)
  role!: CarrierPortalUserRole;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdateCarrierPortalUserDto {
  @IsOptional()
  @IsEnum(CarrierPortalUserRole)
  role?: CarrierPortalUserRole;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}