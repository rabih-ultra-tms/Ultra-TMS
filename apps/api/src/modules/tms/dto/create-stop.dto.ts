import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateStopDto {
  @IsString()
  stopType!: string; // PICKUP, DELIVERY

  @IsNumber()
  stopSequence!: number;

  @IsOptional()
  @IsString()
  facilityName?: string;

  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  postalCode!: string;

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
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsDateString()
  appointmentStart?: string;

  @IsOptional()
  @IsDateString()
  appointmentEnd?: string;

  @IsOptional()
  @IsString()
  appointmentType?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

export class UpdateStopDto extends CreateStopDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  arrivedAt?: string;

  @IsOptional()
  @IsDateString()
  departedAt?: string;

  @IsOptional()
  @IsString()
  signedBy?: string;

  @IsOptional()
  @IsString()
  podNotes?: string;
}

export class CheckCallDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  eta?: string;

  @IsOptional()
  @IsString()
  contactedBy?: string;
}
