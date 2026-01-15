import { DQFDocumentType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDqfDto {
  @ApiProperty({ description: 'Driver ID' })
  @IsString()
  driverId: string;

  @ApiProperty({ enum: DQFDocumentType })
  @IsEnum(DQFDocumentType)
  documentType: DQFDocumentType;

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

  @ApiPropertyOptional({ description: 'Verified flag' })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({ description: 'Clearinghouse status' })
  @IsOptional()
  @IsString()
  clearinghouseStatus?: string;

  @ApiPropertyOptional({ description: 'Last query date', type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastQueryDate?: Date;
}
