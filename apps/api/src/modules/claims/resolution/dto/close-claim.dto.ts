import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CloseClaimDto {
  @ApiPropertyOptional({ description: 'Reason for closing the claim.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
