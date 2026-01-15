import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FactoringCompanyStatus, VerificationMethodEnum } from '../../dto/enums';

export class CreateFactoringCompanyDto {
  @ApiProperty({ description: 'Company code' })
  @IsString()
  companyCode: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Fax' })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: VerificationMethodEnum })
  @IsOptional()
  @IsEnum(VerificationMethodEnum)
  verificationMethod?: VerificationMethodEnum;

  @ApiPropertyOptional({ description: 'API endpoint' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Verification SLA hours', minimum: 1, maximum: 72 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  verificationSLAHours?: number;

  @ApiPropertyOptional({ enum: FactoringCompanyStatus })
  @IsOptional()
  @IsEnum(FactoringCompanyStatus)
  status?: FactoringCompanyStatus;
}
