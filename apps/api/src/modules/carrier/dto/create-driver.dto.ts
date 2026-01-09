import { IsString, IsOptional, IsBoolean, IsEmail, IsDateString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  licenseState?: string;

  @IsOptional()
  @IsString()
  licenseClass?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  ssn?: string;

  @IsOptional()
  @IsBoolean()
  hazmatEndorsement?: boolean;

  @IsOptional()
  @IsDateString()
  hazmatExpiry?: string;

  @IsOptional()
  @IsBoolean()
  twicCard?: boolean;

  @IsOptional()
  @IsDateString()
  twicExpiry?: string;

  @IsOptional()
  @IsDateString()
  medicalCardExpiry?: string;

  @IsOptional()
  @IsDateString()
  mvr?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDriverDto extends CreateDriverDto {
  @IsOptional()
  @IsString()
  status?: string;
}
