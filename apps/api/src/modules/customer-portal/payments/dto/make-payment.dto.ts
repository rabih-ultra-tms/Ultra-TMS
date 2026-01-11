import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export enum PaymentMethodDto {
  CARD = 'CARD',
  ACH = 'ACH',
  WIRE = 'WIRE',
}

export class InvoicePaymentDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class MakePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(PaymentMethodDto)
  paymentMethod!: PaymentMethodDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoicePaymentDto)
  invoices!: InvoicePaymentDto[];

  @IsOptional()
  @IsString()
  savedPaymentMethodId?: string;

  @IsOptional()
  @IsString()
  paymentToken?: string;

  @IsOptional()
  @IsBoolean()
  savePaymentMethod?: boolean;
}