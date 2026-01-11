import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ContractType } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  templateName: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsString()
  templateContent: string;

  @IsOptional()
  @IsString()
  defaultTerms?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
