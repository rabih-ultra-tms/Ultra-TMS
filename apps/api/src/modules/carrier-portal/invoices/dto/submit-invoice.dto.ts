import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class InvoiceLineItemDto {
  @IsString()
  loadId!: string;

  @IsNumber()
  lineHaul!: number;

  @IsNumber()
  fuelSurcharge!: number;

  @IsOptional()
  @IsNumber()
  accessorials?: number;

  @IsNumber()
  total!: number;
}

export class SubmitInvoiceDto {
  @IsString()
  carrierInvoiceNumber!: string;

  @IsArray()
  @IsString({ each: true })
  loadIds!: string[];

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];

  @IsOptional()
  @IsString()
  invoiceDocumentId?: string;

  @IsOptional()
  @IsString()
  carrierNotes?: string;
}