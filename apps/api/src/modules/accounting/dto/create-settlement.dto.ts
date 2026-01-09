import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SettlementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum PaymentType {
  QUICK_PAY = 'QUICK_PAY',
  NET30 = 'NET30',
  FACTORING = 'FACTORING',
}

export enum SettlementLineItemType {
  FREIGHT = 'FREIGHT',
  ACCESSORIAL = 'ACCESSORIAL',
  DEDUCTION = 'DEDUCTION',
  ADVANCE = 'ADVANCE',
}

export class CreateSettlementLineItemDto {
  @IsNumber()
  @Min(1)
  lineNumber!: number;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsOptional()
  @IsEnum(SettlementLineItemType)
  itemType?: SettlementLineItemType;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsNumber()
  unitRate!: number;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsString()
  expenseAccountId?: string;
}

export class CreateSettlementDto {
  @IsString()
  carrierId!: string;

  @IsDateString()
  settlementDate!: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsNumber()
  quickPayFeePercent?: number;

  @IsOptional()
  @IsNumber()
  quickPayFeeAmount?: number;

  @IsNumber()
  grossAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductionsTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quickPayFee?: number;

  @IsNumber()
  netAmount!: number;

  @IsNumber()
  balanceDue!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsEnum(SettlementStatus)
  status?: SettlementStatus;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  payToName?: string;

  @IsOptional()
  @IsBoolean()
  payToFactoring?: boolean;

  @IsOptional()
  @IsString()
  factoringCompanyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  factoringAccount?: string;

  @IsOptional()
  @IsString()
  expenseAccountId?: string;

  @IsOptional()
  @IsString()
  apAccountId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSettlementLineItemDto)
  lineItems?: CreateSettlementLineItemDto[];
}
