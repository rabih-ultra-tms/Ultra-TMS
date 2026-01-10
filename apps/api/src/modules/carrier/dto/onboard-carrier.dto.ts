import { IsEmail, IsOptional, IsString, ValidateIf } from 'class-validator';

export class OnboardCarrierDto {
  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @ValidateIf((value) => !!value.email)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export interface FmcsaLookupResult {
  dotNumber: string;
  mcNumber?: string;
  legalName: string;
  dbaName?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone?: string;
  operatingStatus: string;
  entityType?: string;
  carrierOperation?: string[];
  safetyRating?: string;
  safetyRatingDate?: string;
  insurance: {
    bipdRequired: number;
    bipdOnFile: number;
    cargoRequired: number;
    cargoOnFile: number;
    bondRequired: number;
    bondOnFile: number;
  };
  isAuthorized: boolean;
  complianceIssues: string[];
}
