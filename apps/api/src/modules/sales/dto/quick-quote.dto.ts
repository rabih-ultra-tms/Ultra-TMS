import { IsString, IsOptional, IsDateString } from 'class-validator';

export class AddressDto {
  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

export class QuickQuoteDto {
  @IsString()
  serviceType!: string; // FTL, LTL, PARTIAL

  @IsString()
  equipmentType!: string; // DRY_VAN, REEFER, FLATBED

  @IsString()
  originCity!: string;

  @IsString()
  originState!: string;

  @IsString()
  destinationCity!: string;

  @IsString()
  destinationState!: string;

  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;
}
