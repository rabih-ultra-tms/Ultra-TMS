import { IsOptional, IsString, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class UpdateStopDto {
  @IsOptional()
  @IsString()
  stopType?: string;

  @IsOptional()
  @IsNumber()
  stopSequence?: number;

  @IsOptional()
  @IsString()
  facilityName?: string;

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
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsBoolean()
  appointmentRequired?: boolean;

  @IsOptional()
  @IsString()
  appointmentDate?: string;

  @IsOptional()
  @IsString()
  appointmentTimeStart?: string;

  @IsOptional()
  @IsString()
  appointmentTimeEnd?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
