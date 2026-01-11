import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ContractType } from '@prisma/client';

export class CreateContractDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsDateString()
  effectiveDate: string;

  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsInt()
  renewalTermDays?: number;

  @IsOptional()
  @IsInt()
  noticeDays?: number;
}
