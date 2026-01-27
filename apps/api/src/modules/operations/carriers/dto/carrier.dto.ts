import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export class CreateOperationsCarrierDto {
  @IsString()
  carrierType: string; // COMPANY, OWNER_OPERATOR

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsString()
  einTaxId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneSecondary?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTermsDays?: number;

  @IsOptional()
  @IsString()
  preferredPaymentMethod?: string;

  @IsOptional()
  @IsString()
  factoringCompanyName?: string;

  @IsOptional()
  @IsString()
  factoringCompanyPhone?: string;

  @IsOptional()
  @IsEmail()
  factoringCompanyEmail?: string;

  @IsOptional()
  @IsString()
  insuranceCompany?: string;

  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string;

  @IsOptional()
  @IsString()
  insuranceExpiryDate?: string; // ISO date

  @IsOptional()
  @IsNumber()
  @Min(0)
  cargoInsuranceLimitCents?: number;

  @IsOptional()
  @IsString()
  status?: string; // ACTIVE, INACTIVE, PREFERRED, ON_HOLD, BLACKLISTED

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOperationsCarrierDto extends CreateOperationsCarrierDto {}

export class OperationsCarrierResponseDto {
  id: string;
  tenantId: string;
  carrierType: string;
  companyName: string;
  mcNumber?: string;
  dotNumber?: string;
  einTaxId?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  phoneSecondary?: string;
  email?: string;
  website?: string;
  billingEmail?: string;
  paymentTermsDays: number;
  preferredPaymentMethod?: string;
  factoringCompanyName?: string;
  factoringCompanyPhone?: string;
  factoringCompanyEmail?: string;
  insuranceCompany?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: Date;
  cargoInsuranceLimitCents?: number;
  status: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ListOperationsCarriersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  carrierType?: string;

  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsNumber()
  @Min(10)
  limit: number = 25;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
