import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';

export class CreateContractDto {
  @ApiProperty({ description: 'Contract name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Contract description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ContractType })
  @IsEnum(ContractType)
  contractType!: ContractType;

  @ApiPropertyOptional({ description: 'Customer ID' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Carrier ID' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Agent ID' })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiProperty({ description: 'Effective date', format: 'date-time', type: String })
  @IsDateString()
  effectiveDate!: string;

  @ApiProperty({ description: 'Expiration date', format: 'date-time', type: String })
  @IsDateString()
  expirationDate!: string;

  @ApiPropertyOptional({ description: 'Auto-renew flag' })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiPropertyOptional({ description: 'Renewal term (days)' })
  @IsOptional()
  @IsInt()
  renewalTermDays?: number;

  @ApiPropertyOptional({ description: 'Notice period (days)' })
  @IsOptional()
  @IsInt()
  noticeDays?: number;
}
