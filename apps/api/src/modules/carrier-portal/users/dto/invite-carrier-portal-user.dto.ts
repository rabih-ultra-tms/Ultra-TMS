import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarrierPortalUserRole } from '../types';

export class InviteCarrierPortalUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName!: string;

  @ApiProperty({ enum: CarrierPortalUserRole })
  @IsEnum(CarrierPortalUserRole)
  role!: CarrierPortalUserRole;

  @ApiPropertyOptional({ type: [String], description: 'Permission codes' })
  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdateCarrierPortalUserDto {
  @ApiPropertyOptional({ enum: CarrierPortalUserRole })
  @IsOptional()
  @IsEnum(CarrierPortalUserRole)
  role?: CarrierPortalUserRole;

  @ApiPropertyOptional({ type: [String], description: 'Permission codes' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;
}