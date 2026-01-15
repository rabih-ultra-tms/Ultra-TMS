import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QualifyLeadDto {
  @ApiPropertyOptional({ description: 'Qualification notes' })
  @IsOptional()
  @IsString()
  qualificationNotes?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}