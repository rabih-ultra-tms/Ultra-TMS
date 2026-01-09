import { IsString, IsOptional, IsEmail, IsNumber, IsObject, IsArray, IsBoolean, IsIn } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CUSTOMER', 'PROSPECT', 'PARTNER', 'VENDOR'])
  companyType?: string; // CUSTOMER, PROSPECT, PARTNER, VENDOR

  @IsOptional()
  @IsString()
  @IsIn(['ENTERPRISE', 'MID_MARKET', 'SMB'])
  segment?: string; // ENTERPRISE, MID_MARKET, SMB

  @IsOptional()
  @IsString()
  @IsIn(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'])
  tier?: string; // PLATINUM, GOLD, SILVER, BRONZE

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

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
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  dunsNumber?: string;

  @IsOptional()
  @IsString()
  defaultPickupInstructions?: string;

  @IsOptional()
  @IsString()
  defaultDeliveryInstructions?: string;

  @IsOptional()
  @IsBoolean()
  requiresAppointment?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresLumper?: boolean;

  @IsOptional()
  @IsString()
  parentCompanyId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateCompanyDto extends CreateCompanyDto {}
