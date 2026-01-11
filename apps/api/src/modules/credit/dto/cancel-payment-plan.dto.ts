import { IsOptional, IsString } from 'class-validator';

export class CancelPaymentPlanDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
