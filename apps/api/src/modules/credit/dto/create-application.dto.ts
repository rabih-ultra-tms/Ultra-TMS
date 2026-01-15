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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TradeReferenceDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  @IsNotEmpty()
  company!: string;

  @ApiProperty({ description: 'Contact name' })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ description: 'Contact phone' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateCreditApplicationDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Business name' })
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @ApiProperty({ description: 'Requested limit', minimum: 1000 })
  @IsNumber()
  @Min(1000)
  requestedLimit!: number;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  requestedTerms?: PaymentTerms;

  @ApiPropertyOptional({ description: 'Years in business' })
  @IsOptional()
  @IsInt()
  yearsInBusiness?: number;

  @ApiPropertyOptional({ description: 'Annual revenue' })
  @IsOptional()
  @IsNumber()
  annualRevenue?: number;

  @ApiPropertyOptional({ description: 'DBA name' })
  @IsOptional()
  @IsString()
  dbaName?: string;

  @ApiPropertyOptional({ description: 'Federal tax ID' })
  @IsOptional()
  @IsString()
  federalTaxId?: string;

  @ApiPropertyOptional({ description: 'DUNS number' })
  @IsOptional()
  @IsString()
  dunsNumber?: string;

  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank contact name' })
  @IsOptional()
  @IsString()
  bankContactName?: string;

  @ApiPropertyOptional({ description: 'Bank contact phone' })
  @IsOptional()
  @IsString()
  bankContactPhone?: string;

  @ApiPropertyOptional({ type: [TradeReferenceDto], description: 'Trade references' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TradeReferenceDto)
  tradeReferences?: TradeReferenceDto[];

  @ApiPropertyOptional({ description: 'Owner name' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional({ description: 'Owner address' })
  @IsOptional()
  @IsString()
  ownerAddress?: string;

  @ApiPropertyOptional({ description: 'Owner SSN' })
  @IsOptional()
  @IsString()
  ownerSSN?: string;

  @ApiPropertyOptional({ description: 'Submitted at', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  submittedAt?: string;
}

export class UpdateCreditApplicationDto extends PartialType(CreateCreditApplicationDto) {}
