import { IsString, IsNumber, Min } from 'class-validator';

export class ApplyPaymentDto {
  @IsString()
  invoiceId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;
}
