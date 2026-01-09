import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
}

export enum InvoiceLineItemType {
  FREIGHT = 'FREIGHT',
  ACCESSORIAL = 'ACCESSORIAL',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class CreateInvoiceLineItemDto {
  @IsNumber()
  @Min(1)
  lineNumber!: number;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsEnum(InvoiceLineItemType)
  itemType?: InvoiceLineItemType;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsNumber()
  unitPrice!: number;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  revenueAccountId?: string;
}

export class CreateInvoiceDto {
  @IsString()
  companyId!: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsDateString()
  invoiceDate!: string;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  subtotal!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @IsNumber()
  totalAmount!: number;

  @IsNumber()
  balanceDue!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentTerms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  revenueAccountId?: string;

  @IsOptional()
  @IsString()
  arAccountId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemDto)
  lineItems?: CreateInvoiceLineItemDto[];
}
