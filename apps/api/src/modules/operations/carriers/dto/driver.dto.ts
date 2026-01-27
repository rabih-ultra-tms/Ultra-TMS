import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateOperationsCarrierDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

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
  cdlNumber?: string;

  @IsOptional()
  @IsString()
  cdlState?: string;

  @IsOptional()
  @IsString()
  cdlClass?: string;

  @IsOptional()
  @IsString()
  cdlExpiry?: string; // ISO date

  @IsOptional()
  @IsString()
  cdlEndorsements?: string;

  @IsOptional()
  @IsString()
  medicalCardExpiry?: string; // ISO date

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  status?: string; // ACTIVE, INACTIVE, ON_LEAVE

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOperationsCarrierDriverDto
  extends CreateOperationsCarrierDriverDto {}

export class OperationsCarrierDriverResponseDto {
  id: string;
  carrierId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  isOwner: boolean;
  phone?: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  cdlNumber?: string;
  cdlState?: string;
  cdlClass?: string;
  cdlExpiry?: Date;
  cdlEndorsements?: string;
  medicalCardExpiry?: Date;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
