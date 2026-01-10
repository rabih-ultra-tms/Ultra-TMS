import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentTerms } from './enums';

export class ApproveCreditApplicationDto {
  @IsNumber()
  @Min(0)
  approvedLimit!: number;

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms?: PaymentTerms;

  @IsOptional()
  @IsString()
  decisionNotes?: string;
}
