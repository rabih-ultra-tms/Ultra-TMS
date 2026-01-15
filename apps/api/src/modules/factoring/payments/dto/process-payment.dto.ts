import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { FactoredPaymentStatus, PaymentMethodType } from '../../dto/enums';

export class ProcessFactoredPaymentDto {
  @ApiPropertyOptional({ description: 'Payment amount applied to the factored settlement.' })
  @IsOptional()
  @IsNumber()
  paymentAmount?: number;

  @ApiPropertyOptional({ description: 'Payment date in ISO 8601 format.' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ enum: PaymentMethodType, description: 'Payment method used for settlement.' })
  @IsOptional()
  @IsEnum(PaymentMethodType)
  paymentMethod?: PaymentMethodType;

  @ApiPropertyOptional({ description: 'Verification or reference code for the payment.' })
  @IsOptional()
  @IsString()
  verificationCode?: string;

  @ApiPropertyOptional({ description: 'Optional notes or memo for the payment.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: FactoredPaymentStatus, description: 'Current status of the factored payment.' })
  @IsOptional()
  @IsEnum(FactoredPaymentStatus)
  status?: FactoredPaymentStatus;
}
