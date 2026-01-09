import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsObject,
  IsArray,
  IsEnum,
  IsEmail,
  Min,
  Max,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum CarrierStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED',
}

export enum QualificationTier {
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
  UNQUALIFIED = 'UNQUALIFIED',
}

export enum CompanyType {
  LLC = 'LLC',
  CORP = 'CORP',
  SOLE_PROP = 'SOLE_PROP',
  PARTNERSHIP = 'PARTNERSHIP',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CHECK = 'CHECK',
  ACH = 'ACH',
  WIRE = 'WIRE',
  QUICKPAY = 'QUICKPAY',
}

export enum EquipmentType {
  DRY_VAN = 'DRY_VAN',
  REEFER = 'REEFER',
  FLATBED = 'FLATBED',
  STEP_DECK = 'STEP_DECK',
  LOWBOY = 'LOWBOY',
  TANKER = 'TANKER',
  HOPPER = 'HOPPER',
  POWER_ONLY = 'POWER_ONLY',
  CONESTOGA = 'CONESTOGA',
  DOUBLE_DROP = 'DOUBLE_DROP',
  RGNS = 'RGNS',
  DUMP = 'DUMP',
  CONTAINER = 'CONTAINER',
  INTERMODAL = 'INTERMODAL',
  AUTO_CARRIER = 'AUTO_CARRIER',
  SPRINTER = 'SPRINTER',
  BOX_TRUCK = 'BOX_TRUCK',
}

// ============================================
// CREATE CARRIER DTO
// ============================================
export class CreateCarrierDto {
  @IsString()
  mcNumber!: string;

  @IsString()
  dotNumber!: string;

  @IsOptional()
  @IsString()
  scacCode?: string;

  @IsString()
  legalName!: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  zipCode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  dispatchEmail?: string;

  @IsOptional()
  @IsString()
  dispatchPhone?: string;

  @IsOptional()
  @IsString()
  afterHoursPhone?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsBoolean()
  w9OnFile?: boolean;

  @IsOptional()
  @IsNumber()
  paymentTerms?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankRoutingNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountType?: string;

  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @IsOptional()
  @IsNumber()
  truckCount?: number;

  @IsOptional()
  @IsNumber()
  trailerCount?: number;

  @IsOptional()
  @IsArray()
  serviceStates?: string[];

  @IsOptional()
  @IsArray()
  preferredLanes?: Array<{ origin: string; destination: string }>;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  sourceSystem?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

// ============================================
// UPDATE CARRIER DTO
// ============================================
export class UpdateCarrierDto {
  @IsOptional()
  @IsString()
  scacCode?: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsEnum(CompanyType)
  companyType?: CompanyType;

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
  zipCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsEmail()
  dispatchEmail?: string;

  @IsOptional()
  @IsString()
  dispatchPhone?: string;

  @IsOptional()
  @IsString()
  afterHoursPhone?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsBoolean()
  w9OnFile?: boolean;

  @IsOptional()
  @IsNumber()
  paymentTerms?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankRoutingNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountType?: string;

  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @IsOptional()
  @IsNumber()
  truckCount?: number;

  @IsOptional()
  @IsNumber()
  trailerCount?: number;

  @IsOptional()
  @IsArray()
  serviceStates?: string[];

  @IsOptional()
  @IsArray()
  preferredLanes?: Array<{ origin: string; destination: string }>;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

// ============================================
// STATUS UPDATE DTO
// ============================================
export class UpdateCarrierStatusDto {
  @IsEnum(CarrierStatus)
  status!: CarrierStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

// ============================================
// TIER UPDATE DTO
// ============================================
export class UpdateCarrierTierDto {
  @IsEnum(QualificationTier)
  tier!: QualificationTier;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// LOOKUP DTOs
// ============================================
export class LookupMcDto {
  @IsString()
  mcNumber!: string;
}

export class LookupDotDto {
  @IsString()
  dotNumber!: string;
}

// ============================================
// SEARCH DTO
// ============================================
export class CarrierSearchDto {
  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @IsOptional()
  @IsArray()
  serviceStates?: string[];

  @IsOptional()
  @IsString()
  originCity?: string;

  @IsOptional()
  @IsString()
  originState?: string;

  @IsOptional()
  @IsString()
  destinationCity?: string;

  @IsOptional()
  @IsString()
  destinationState?: string;

  @IsOptional()
  @IsArray()
  tiers?: string[];

  @IsOptional()
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsNumber()
  minLoads?: number;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============================================
// LIST QUERY DTO
// ============================================
export class CarrierListQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

  @IsOptional()
  @IsEnum(QualificationTier)
  tier?: QualificationTier;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  equipmentTypes?: string[];

  @IsOptional()
  @IsArray()
  serviceStates?: string[];

  @IsOptional()
  @IsBoolean()
  includeContacts?: boolean;
}
