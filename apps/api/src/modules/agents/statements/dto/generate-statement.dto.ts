import { IsDateString, IsOptional } from 'class-validator';

export class GenerateStatementDto {
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}