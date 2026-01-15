import { DQFDocumentType } from '@prisma/client';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AddDqfDocumentDto {
  @ApiPropertyOptional({ enum: DQFDocumentType })
  @IsOptional()
  @IsEnum(DQFDocumentType)
  documentType?: DQFDocumentType;

  @ApiPropertyOptional({ description: 'Document number' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Document URL' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ description: 'Issue date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @ApiPropertyOptional({ description: 'Expiration date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: Date;
}
