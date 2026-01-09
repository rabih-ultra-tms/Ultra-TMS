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

export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOID = 'VOID',
}

export enum JournalEntryReferenceType {
  INVOICE = 'INVOICE',
  SETTLEMENT = 'SETTLEMENT',
  PAYMENT = 'PAYMENT',
  MANUAL = 'MANUAL',
}

export class CreateJournalEntryLineDto {
  @IsNumber()
  @Min(1)
  lineNumber!: number;

  @IsString()
  accountId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  debitAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditAmount?: number;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;
}

export class CreateJournalEntryDto {
  @IsDateString()
  entryDate!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(JournalEntryReferenceType)
  referenceType?: JournalEntryReferenceType;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsEnum(JournalEntryStatus)
  status?: JournalEntryStatus;

  @IsNumber()
  totalDebit!: number;

  @IsNumber()
  totalCredit!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines!: CreateJournalEntryLineDto[];
}
