import { IsString, IsOptional, IsNumber, IsUUID, IsBoolean, IsArray } from 'class-validator';

export class CreateAccessorialRateDto {
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @IsString()
  accessorialType!: string; // DETENTION, LAYOVER, LUMPER, etc.

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  rateType!: string; // FLAT, PER_HOUR, PER_MILE, PERCENT

  @IsNumber()
  rateAmount!: number;

  @IsOptional()
  @IsNumber()
  minimumCharge?: number;

  @IsOptional()
  @IsNumber()
  maximumCharge?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToServiceTypes?: string[]; // ['FTL', 'LTL']

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  status?: string; // ACTIVE, INACTIVE
}

export class UpdateAccessorialRateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  rateType?: string;

  @IsOptional()
  @IsNumber()
  rateAmount?: number;

  @IsOptional()
  @IsNumber()
  minimumCharge?: number;

  @IsOptional()
  @IsNumber()
  maximumCharge?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToServiceTypes?: string[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}
