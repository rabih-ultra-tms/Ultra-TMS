import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFuelTableDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  basePrice: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsDateString()
  effectiveDate: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
