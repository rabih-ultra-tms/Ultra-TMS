import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MaxLength,
  IsNumber,
} from 'class-validator';

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum NormalBalance {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class CreateChartOfAccountDto {
  @IsString()
  @MaxLength(20)
  accountNumber!: string;

  @IsString()
  @MaxLength(255)
  accountName!: string;

  @IsEnum(AccountType)
  accountType!: AccountType;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountSubType?: string;

  @IsOptional()
  @IsString()
  parentAccountId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(NormalBalance)
  normalBalance!: NormalBalance;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSystemAccount?: boolean;

  @IsOptional()
  @IsNumber()
  balance?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  quickbooksId?: string;
}
