import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentAllocationDto {
  @IsUUID()
  invoiceId: string;

  @IsNumber()
  amount: number;
}

export class BatchPaymentItemDto {
  @IsUUID()
  companyId: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  checkNumber?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];
}

export class BatchPaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchPaymentItemDto)
  payments: BatchPaymentItemDto[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;
}
