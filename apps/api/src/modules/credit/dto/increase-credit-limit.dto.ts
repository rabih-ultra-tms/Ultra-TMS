import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentTerms } from './enums';

export class IncreaseCreditLimitDto {
  @IsNumber()
  @Min(0)
  increaseBy!: number;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
