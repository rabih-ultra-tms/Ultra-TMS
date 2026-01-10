import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CreditLimitStatus, PaymentTerms } from './enums';

export class CreateCreditLimitDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  usedCredit?: number;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsEnum(CreditLimitStatus)
  status?: CreditLimitStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  singleLoadLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gracePeriodDays?: number;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reviewFrequencyDays?: number;
}
