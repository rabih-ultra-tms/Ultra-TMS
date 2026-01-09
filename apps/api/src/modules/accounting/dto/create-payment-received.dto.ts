import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';

export enum PaymentReceivedStatus {
  RECEIVED = 'RECEIVED',
  APPLIED = 'APPLIED',
  PARTIAL = 'PARTIAL',
  BOUNCED = 'BOUNCED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CHECK = 'CHECK',
  ACH = 'ACH',
  WIRE = 'WIRE',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
}

export class CreatePaymentReceivedDto {
  @IsString()
  companyId!: string;

  @IsDateString()
  paymentDate!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unappliedAmount?: number;

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
  @IsDateString()
  depositDate?: string;

  @IsOptional()
  @IsEnum(PaymentReceivedStatus)
  status?: PaymentReceivedStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
