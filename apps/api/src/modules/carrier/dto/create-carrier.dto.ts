import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, IsUUID, IsArray, IsObject, IsDateString } from 'class-validator';

export class CreateCarrierDto {
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
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsString()
  scacCode?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  carrierType?: string; // ASSET, OWNER_OPERATOR, CARRIER

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
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  dispatchPhone?: string;

  @IsOptional()
  @IsEmail()
  dispatchEmail?: string;

  @IsOptional()
  @IsString()
  factoringCompany?: string;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsNumber()
  defaultPaymentDays?: number;

  @IsOptional()
  @IsString()
  w9OnFile?: string;

  @IsOptional()
  @IsBoolean()
  quickpayEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  quickpayPercent?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @IsOptional()
  @IsArray()
  serviceAreas?: string[];

  @IsOptional()
  @IsNumber()
  safetyRating?: number;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateCarrierDto extends CreateCarrierDto {
  @IsOptional()
  @IsString()
  status?: string;
}
