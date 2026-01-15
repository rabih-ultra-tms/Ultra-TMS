import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreditLimitStatus, PaymentTerms } from './enums';

export class CreateCreditLimitDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiProperty({ description: 'Credit limit', minimum: 0 })
  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @ApiPropertyOptional({ description: 'Used credit', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usedCredit?: number;

  @ApiPropertyOptional({ enum: PaymentTerms })
  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @ApiPropertyOptional({ enum: CreditLimitStatus })
  @IsOptional()
  @IsEnum(CreditLimitStatus)
  status?: CreditLimitStatus;

  @ApiPropertyOptional({ description: 'Single load limit', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  singleLoadLimit?: number;

  @ApiPropertyOptional({ description: 'Monthly limit', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyLimit?: number;

  @ApiPropertyOptional({ description: 'Grace period (days)', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ description: 'Next review date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;

  @ApiPropertyOptional({ description: 'Review frequency (days)', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reviewFrequencyDays?: number;
}
