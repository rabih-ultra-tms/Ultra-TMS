import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
} from 'class-validator';
import { PaymentTerms } from './enums';
import { PartialType } from '@nestjs/mapped-types';

export class TradeReferenceDto {
  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  contact!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateCreditApplicationDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsNumber()
  @Min(1000)
  requestedLimit!: number;

  @IsOptional()
  @IsEnum(PaymentTerms)
  requestedTerms?: PaymentTerms;

  @IsOptional()
  @IsInt()
  yearsInBusiness?: number;

  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsString()
  federalTaxId?: string;

  @IsOptional()
  @IsString()
  dunsNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankContactName?: string;

  @IsOptional()
  @IsString()
  bankContactPhone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TradeReferenceDto)
  tradeReferences?: TradeReferenceDto[];

  @IsOptional()
  @IsString()
  ownerName?: string;

  @IsOptional()
  @IsString()
  ownerAddress?: string;

  @IsOptional()
  @IsString()
  ownerSSN?: string;

  @IsOptional()
  @IsDateString()
  submittedAt?: string;
}

export class UpdateCreditApplicationDto extends PartialType(CreateCreditApplicationDto) {}
