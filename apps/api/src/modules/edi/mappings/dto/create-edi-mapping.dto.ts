import { EdiTransactionType } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateEdiMappingDto {
  @IsString()
  tradingPartnerId: string;

  @IsEnum(EdiTransactionType)
  transactionType: EdiTransactionType;

  @IsObject()
  fieldMappings: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  defaultValues?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  transformRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  validationRules?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
