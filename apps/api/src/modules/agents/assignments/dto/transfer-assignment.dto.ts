import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferAssignmentDto {
  @ApiProperty({ description: 'Target agent ID' })
  @IsString()
  toAgentId!: string;

  @ApiPropertyOptional({ description: 'Reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}