import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AgentStatusDto {
  @ApiPropertyOptional({ description: 'Status reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}