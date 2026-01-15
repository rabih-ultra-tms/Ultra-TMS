import { InsuranceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInsuranceDto {
  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiProperty({ enum: InsuranceType })
  @IsEnum(InsuranceType)
  insuranceType: InsuranceType;

  @ApiProperty({ description: 'Policy number' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ description: 'Insurance carrier name' })
  @IsString()
  carrierName: string;

  @ApiProperty({ description: 'Coverage amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @ApiProperty({ description: 'Effective date', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @ApiProperty({ description: 'Expiration date', type: String, format: 'date-time' })
  @IsDate()
  @Type(() => Date)
  expirationDate: Date;

  @ApiPropertyOptional({ description: 'Agent name' })
  @IsOptional()
  @IsString()
  agentName?: string;

  @ApiPropertyOptional({ description: 'Agent phone' })
  @IsOptional()
  @IsPhoneNumber('US')
  agentPhone?: string;

  @ApiPropertyOptional({ description: 'Agent email' })
  @IsOptional()
  @IsEmail()
  agentEmail?: string;

  @ApiPropertyOptional({ description: 'Verified flag' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Certificate URL' })
  @IsOptional()
  @IsString()
  certificateUrl?: string;
}
