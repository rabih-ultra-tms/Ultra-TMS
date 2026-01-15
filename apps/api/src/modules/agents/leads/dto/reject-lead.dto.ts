import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RejectLeadDto {
  @ApiPropertyOptional({ description: 'Rejection reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}