import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class RecoverSubrogationDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  settlementAmount?: number;
}
