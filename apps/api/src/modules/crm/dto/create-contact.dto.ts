import { IsString, IsOptional, IsEmail, IsUUID, IsBoolean, IsArray, IsObject } from 'class-validator';

export class CreateContactDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

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
  title?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  receivesInvoices?: boolean;

  @IsOptional()
  @IsBoolean()
  receivesNotifications?: boolean;

  @IsOptional()
  @IsString()
  preferredContactMethod?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateContactDto extends CreateContactDto {}
