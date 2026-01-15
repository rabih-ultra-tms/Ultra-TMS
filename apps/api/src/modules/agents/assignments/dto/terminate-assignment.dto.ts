import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TerminateAssignmentDto {
  @ApiPropertyOptional({ description: 'Termination reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}