import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsEmail,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum InsuranceType {
  AUTO_LIABILITY = 'AUTO_LIABILITY',
  CARGO = 'CARGO',
  GENERAL_LIABILITY = 'GENERAL_LIABILITY',
  WORKERS_COMP = 'WORKERS_COMP',
}

export enum InsuranceStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ============================================
// CREATE INSURANCE DTO
// ============================================
export class CreateInsuranceDto {
  @IsEnum(InsuranceType)
  insuranceType!: InsuranceType;

  @IsString()
  policyNumber!: string;

  @IsString()
  insurerName!: string;

  @IsOptional()
  @IsString()
  insurerPhone?: string;

  @IsOptional()
  @IsEmail()
  insurerEmail?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  agentPhone?: string;

  @IsNumber()
  coverageAmount!: number;

  @IsOptional()
  @IsNumber()
  deductible?: number;

  @IsDateString()
  effectiveDate!: string;

  @IsDateString()
  expirationDate!: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// UPDATE INSURANCE DTO
// ============================================
export class UpdateInsuranceDto {
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsString()
  insurerName?: string;

  @IsOptional()
  @IsString()
  insurerPhone?: string;

  @IsOptional()
  @IsEmail()
  insurerEmail?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  agentPhone?: string;

  @IsOptional()
  @IsNumber()
  coverageAmount?: number;

  @IsOptional()
  @IsNumber()
  deductible?: number;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsEnum(InsuranceStatus)
  status?: InsuranceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// VERIFY INSURANCE DTO
// ============================================
export class VerifyInsuranceDto {
  @IsBoolean()
  isVerified!: boolean;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}

// ============================================
// LIST QUERY DTO
// ============================================
export class InsuranceListQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(InsuranceType)
  insuranceType?: InsuranceType;

  @IsOptional()
  @IsEnum(InsuranceStatus)
  status?: InsuranceStatus;

  @IsOptional()
  @IsBoolean()
  expiringSoon?: boolean;

  @IsOptional()
  @IsNumber()
  daysUntilExpiration?: number;
}
