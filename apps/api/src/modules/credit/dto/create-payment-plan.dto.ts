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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentPlanInvoiceDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;
}

export class CreatePaymentPlanDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ type: [PaymentPlanInvoiceDto], description: 'Invoices' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentPlanInvoiceDto)
  invoices!: PaymentPlanInvoiceDto[];

  @ApiProperty({ description: 'Down payment', minimum: 0 })
  @IsNumber()
  @Min(0)
  downPayment!: number;

  @ApiProperty({ description: 'Installment count', minimum: 1 })
  @IsNumber()
  @Min(1)
  installmentCount!: number;

  @ApiProperty({ enum: PaymentFrequency })
  @IsEnum(PaymentFrequency)
  frequency!: PaymentFrequency;

  @ApiProperty({ description: 'First payment date', format: 'date-time', type: String })
  @IsDateString()
  firstPaymentDate!: string;

  @ApiPropertyOptional({ description: 'Interest rate', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @ApiPropertyOptional({ description: 'Late fee percent', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeePct?: number;

  @ApiPropertyOptional({ description: 'Late fee fixed', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeFixed?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
