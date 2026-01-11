import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { FactoredPaymentStatus, PaymentMethodType } from '../../dto/enums';

export class ProcessFactoredPaymentDto {
  @IsOptional()
  @IsNumber()
  paymentAmount?: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(PaymentMethodType)
  paymentMethod?: PaymentMethodType;

  @IsOptional()
  @IsString()
  verificationCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(FactoredPaymentStatus)
  status?: FactoredPaymentStatus;
}
