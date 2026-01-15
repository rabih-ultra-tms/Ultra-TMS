import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClaimDocumentDto {
  @ApiProperty({ description: 'Document identifier stored for the claim.' })
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @ApiProperty({ description: 'Document type or category.' })
  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @ApiPropertyOptional({ description: 'Optional document description.' })
  @IsOptional()
  @IsString()
  description?: string;
}
