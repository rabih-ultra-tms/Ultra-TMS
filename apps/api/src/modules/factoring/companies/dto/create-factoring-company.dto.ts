import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FactoringCompanyStatus, VerificationMethodEnum } from '../../dto/enums';

export class CreateFactoringCompanyDto {
  @IsString()
  companyCode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(VerificationMethodEnum)
  verificationMethod?: VerificationMethodEnum;

  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(72)
  verificationSLAHours?: number;

  @IsOptional()
  @IsEnum(FactoringCompanyStatus)
  status?: FactoringCompanyStatus;
}
