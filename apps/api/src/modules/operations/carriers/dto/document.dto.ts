import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateOperationsCarrierDocumentDto {
  @IsString()
  documentType: string; // W9 | CARRIER_AGREEMENT | AUTHORITY_LETTER | VOID_CHECK | INSURANCE_CERTIFICATE | OTHER

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string; // ISO date string, e.g. "2027-01-01"
}
