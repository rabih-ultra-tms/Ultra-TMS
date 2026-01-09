import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  IsEnum,
  IsEmail,
} from 'class-validator';

// ============================================
// ENUMS
// ============================================
export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum DriverAvailability {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  EN_ROUTE = 'EN_ROUTE',
}

export enum CdlClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum CdlEndorsement {
  H = 'H', // Hazmat
  N = 'N', // Tank
  P = 'P', // Passenger
  S = 'S', // School Bus
  T = 'T', // Double/Triple
  X = 'X', // Hazmat + Tank
}

export enum HosStatus {
  OFF_DUTY = 'OFF_DUTY',
  SLEEPER = 'SLEEPER',
  DRIVING = 'DRIVING',
  ON_DUTY = 'ON_DUTY',
}

// ============================================
// CREATE DRIVER DTO
// ============================================
export class CreateDriverDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  phone!: string;

  @IsString()
  cdlNumber!: string;

  @IsString()
  cdlState!: string;

  @IsEnum(CdlClass)
  cdlClass!: CdlClass;

  @IsDateString()
  cdlExpiration!: string;

  @IsOptional()
  @IsArray()
  endorsements?: string[];

  @IsOptional()
  @IsDateString()
  medicalCardExpiration?: string;

  @IsOptional()
  @IsBoolean()
  medicalCardOnFile?: boolean;

  @IsOptional()
  @IsString()
  assignedTruckNumber?: string;

  @IsOptional()
  @IsString()
  assignedTrailerNumber?: string;

  @IsOptional()
  @IsString()
  eldProvider?: string;

  @IsOptional()
  @IsString()
  eldProviderId?: string;

  @IsOptional()
  @IsString()
  trackingAppId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// UPDATE DRIVER DTO
// ============================================
export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  cdlNumber?: string;

  @IsOptional()
  @IsString()
  cdlState?: string;

  @IsOptional()
  @IsEnum(CdlClass)
  cdlClass?: CdlClass;

  @IsOptional()
  @IsDateString()
  cdlExpiration?: string;

  @IsOptional()
  @IsArray()
  endorsements?: string[];

  @IsOptional()
  @IsDateString()
  medicalCardExpiration?: string;

  @IsOptional()
  @IsBoolean()
  medicalCardOnFile?: boolean;

  @IsOptional()
  @IsString()
  assignedTruckNumber?: string;

  @IsOptional()
  @IsString()
  assignedTrailerNumber?: string;

  @IsOptional()
  @IsString()
  eldProvider?: string;

  @IsOptional()
  @IsString()
  eldProviderId?: string;

  @IsOptional()
  @IsString()
  trackingAppId?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsEnum(DriverAvailability)
  availability?: DriverAvailability;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// UPDATE LOCATION DTO
// ============================================
export class UpdateDriverLocationDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

// ============================================
// LIST QUERY DTO
// ============================================
export class DriverListQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsEnum(DriverAvailability)
  availability?: DriverAvailability;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  expiringSoon?: boolean;
}
