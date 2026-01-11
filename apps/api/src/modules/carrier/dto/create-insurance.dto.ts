import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean, IsEnum, Min, IsUrl, IsNotEmpty } from 'class-validator';
import { InsuranceType } from './enums';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInsuranceDto {
  @IsEnum(InsuranceType)
  type!: InsuranceType;

  @IsString()
  @IsNotEmpty()
  insuranceCompany!: string;

  @IsString()
  @IsNotEmpty()
  policyNumber!: string;

  @IsNumber()
  @Min(0)
  coverageAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @IsDateString()
  effectiveDate!: string;

  @IsDateString()
  expirationDate!: string;

  @IsOptional()
  @IsString()
  certificateHolder?: string;

  @IsOptional()
  @IsBoolean()
  additionalInsured?: boolean;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

export class UpdateInsuranceDto extends PartialType(CreateInsuranceDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
