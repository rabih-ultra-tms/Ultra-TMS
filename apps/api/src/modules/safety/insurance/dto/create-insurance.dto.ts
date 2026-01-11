import { InsuranceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Min } from 'class-validator';

export class CreateInsuranceDto {
  @IsString()
  carrierId: string;

  @IsEnum(InsuranceType)
  insuranceType: InsuranceType;

  @IsString()
  policyNumber: string;

  @IsString()
  carrierName: string;

  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @IsDate()
  @Type(() => Date)
  expirationDate: Date;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsPhoneNumber('US')
  agentPhone?: string;

  @IsOptional()
  @IsEmail()
  agentEmail?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  certificateUrl?: string;
}
