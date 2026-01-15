import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EdiDirection, EdiTransactionType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ImportEdiDocumentDto {
  @ApiProperty({ description: 'Trading partner identifier.' })
  @IsString()
  tradingPartnerId: string;

  @ApiProperty({ enum: EdiTransactionType, description: 'EDI transaction type.' })
  @IsEnum(EdiTransactionType)
  transactionType: EdiTransactionType;

  @ApiPropertyOptional({ enum: EdiDirection, description: 'Direction of the EDI document.' })
  @IsOptional()
  @IsEnum(EdiDirection)
  direction?: EdiDirection;

  @ApiProperty({ description: 'Raw EDI content.' })
  @IsString()
  rawContent: string;

  @ApiPropertyOptional({ description: 'Entity type linked to the document.' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Entity identifier linked to the document.' })
  @IsOptional()
  @IsString()
  entityId?: string;
}
