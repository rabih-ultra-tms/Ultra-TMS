import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReprocessDocumentDto {
  @ApiPropertyOptional({ description: 'Reason for reprocessing the document.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
