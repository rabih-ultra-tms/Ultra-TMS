import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EdiTransactionType } from '@prisma/client';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateEdiMappingDto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ enum: EdiTransactionType, description: 'EDI transaction type for the mapping.' })
  @IsEnum(EdiTransactionType)
  transactionType: EdiTransactionType;

  @ApiProperty({ type: 'object', description: 'Field mappings configuration.' })
  @IsObject()
  fieldMappings: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', description: 'Default values to apply during mapping.' })
  @IsOptional()
  @IsObject()
  defaultValues?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', description: 'Transformation rules for the mapping.' })
  @IsOptional()
  @IsObject()
  transformRules?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', description: 'Validation rules for the mapping.' })
  @IsOptional()
  @IsObject()
  validationRules?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Whether the mapping is active.' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
