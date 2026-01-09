import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateCommissionPayoutDto {
  @IsString()
  userId!: string;

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApprovePayoutDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ProcessPayoutDto {
  @IsString()
  paymentMethod!: string; // CHECK, ACH, PAYROLL

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
