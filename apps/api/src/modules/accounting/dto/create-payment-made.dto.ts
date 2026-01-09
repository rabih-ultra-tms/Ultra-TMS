import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';

export enum PaymentMadeStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CLEARED = 'CLEARED',
  VOID = 'VOID',
}

export enum PaymentMadeMethod {
  CHECK = 'CHECK',
  ACH = 'ACH',
  WIRE = 'WIRE',
}

export class CreatePaymentMadeDto {
  @IsString()
  carrierId!: string;

  @IsDateString()
  paymentDate!: string;

  @IsEnum(PaymentMadeMethod)
  paymentMethod!: PaymentMadeMethod;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsEnum(PaymentMadeStatus)
  status?: PaymentMadeStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  achBatchId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  achTraceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
