import { IsString, IsOptional, IsNumber, IsUUID, IsDateString } from 'class-validator';

export class CreateSalesQuotaDto {
  @IsUUID()
  userId!: string;

  @IsString()
  periodType!: string; // MONTHLY, QUARTERLY, ANNUAL

  @IsDateString()
  periodStart!: string;

  @IsDateString()
  periodEnd!: string;

  @IsOptional()
  @IsNumber()
  revenueTarget?: number;

  @IsOptional()
  @IsNumber()
  loadsTarget?: number;

  @IsOptional()
  @IsNumber()
  newCustomersTarget?: number;

  @IsOptional()
  @IsString()
  status?: string; // ACTIVE, INACTIVE
}

export class UpdateSalesQuotaDto {
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;

  @IsOptional()
  @IsNumber()
  revenueTarget?: number;

  @IsOptional()
  @IsNumber()
  loadsTarget?: number;

  @IsOptional()
  @IsNumber()
  newCustomersTarget?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class PerformanceQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
