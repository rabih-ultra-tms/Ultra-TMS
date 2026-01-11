import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class EnrollQuickPayDto {
  @IsNumber()
  @Min(0)
  @Max(0.1)
  quickPayFeePercent: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.1)
  quickPayFeePercentMax?: number;
}
