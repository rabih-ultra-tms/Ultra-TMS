import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum ContactRole {
  OWNER = 'OWNER',
  DISPATCHER = 'DISPATCHER',
  ACCOUNTING = 'ACCOUNTING',
  SAFETY = 'SAFETY',
  DRIVER = 'DRIVER',
}

export enum PreferredContactMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
}

// ============================================
// CREATE CONTACT DTO
// ============================================
export class CreateCarrierContactDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsEnum(ContactRole)
  role!: ContactRole;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsEnum(PreferredContactMethod)
  preferredContact?: PreferredContactMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// UPDATE CONTACT DTO
// ============================================
export class UpdateCarrierContactDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ContactRole)
  role?: ContactRole;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsEnum(PreferredContactMethod)
  preferredContact?: PreferredContactMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}
