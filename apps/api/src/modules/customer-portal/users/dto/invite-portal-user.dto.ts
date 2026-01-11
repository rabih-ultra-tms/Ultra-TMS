import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PortalUserRole } from '@prisma/client';

export class InvitePortalUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEnum(PortalUserRole)
  role!: PortalUserRole;

  @IsOptional()
  @IsArray()
  permissions?: string[];
}

export class UpdatePortalUserDto {
  @IsOptional()
  @IsEnum(PortalUserRole)
  role?: PortalUserRole;

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