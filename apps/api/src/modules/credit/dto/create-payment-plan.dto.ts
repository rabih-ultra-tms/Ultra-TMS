import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentFrequency } from './enums';

export class PaymentPlanInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;
}

export class CreatePaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentPlanInvoiceDto)
  invoices!: PaymentPlanInvoiceDto[];

  @IsNumber()
  @Min(0)
  downPayment!: number;

  @IsNumber()
  @Min(1)
  installmentCount!: number;

  @IsEnum(PaymentFrequency)
  frequency!: PaymentFrequency;

  @IsDateString()
  firstPaymentDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeePct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeFixed?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
