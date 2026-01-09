import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateInsuranceDto {
  @IsString()
  insuranceType!: string; // AUTO_LIABILITY, CARGO, GENERAL_LIABILITY, WORKERS_COMP

  @IsString()
  policyNumber!: string;

  @IsOptional()
  @IsString()
  insurer?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  agentPhone?: string;

  @IsOptional()
  @IsString()
  agentEmail?: string;

  @IsDateString()
  effectiveDate!: string;

  @IsDateString()
  expirationDate!: string;

  @IsOptional()
  @IsNumber()
  coverageAmount?: number;

  @IsOptional()
  @IsNumber()
  deductible?: number;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsDateString()
  verifiedAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInsuranceDto extends CreateInsuranceDto {
  @IsOptional()
  @IsString()
  status?: string;
}
