import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceLineItemDto {
  @ApiProperty({ description: 'Load ID' })
  @IsString()
  loadId!: string;

  @ApiProperty({ description: 'Line haul amount' })
  @IsNumber()
  lineHaul!: number;

  @ApiProperty({ description: 'Fuel surcharge amount' })
  @IsNumber()
  fuelSurcharge!: number;

  @ApiPropertyOptional({ description: 'Accessorials amount' })
  @IsOptional()
  @IsNumber()
  accessorials?: number;

  @ApiProperty({ description: 'Line item total' })
  @IsNumber()
  total!: number;
}

export class SubmitInvoiceDto {
  @ApiProperty({ description: 'Carrier invoice number' })
  @IsString()
  carrierInvoiceNumber!: string;

  @ApiProperty({ type: [String], description: 'Load IDs' })
  @IsArray()
  @IsString({ each: true })
  loadIds!: string[];

  @ApiProperty({ description: 'Total amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @ApiProperty({ type: [InvoiceLineItemDto], description: 'Invoice line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems!: InvoiceLineItemDto[];

  @ApiPropertyOptional({ description: 'Invoice document ID' })
  @IsOptional()
  @IsString()
  invoiceDocumentId?: string;

  @ApiPropertyOptional({ description: 'Carrier notes' })
  @IsOptional()
  @IsString()
  carrierNotes?: string;
}