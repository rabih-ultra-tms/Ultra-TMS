import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodDto {
  CARD = 'CARD',
  ACH = 'ACH',
  WIRE = 'WIRE',
}

export class InvoicePaymentDto {
  @ApiProperty({ description: 'Invoice ID' })
  @IsString()
  invoiceId!: string;

  @ApiProperty({ description: 'Payment amount', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;
}

export class MakePaymentDto {
  @ApiProperty({ description: 'Total payment amount', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  paymentMethod!: PaymentMethodDto;

  @ApiProperty({ type: [InvoicePaymentDto], description: 'Invoice allocations' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoicePaymentDto)
  invoices!: InvoicePaymentDto[];

  @ApiPropertyOptional({ description: 'Saved payment method ID' })
  @IsOptional()
  @IsString()
  savedPaymentMethodId?: string;

  @ApiPropertyOptional({ description: 'Payment token' })
  @IsOptional()
  @IsString()
  paymentToken?: string;

  @ApiPropertyOptional({ description: 'Save payment method flag' })
  @IsOptional()
  @IsBoolean()
  savePaymentMethod?: boolean;
}