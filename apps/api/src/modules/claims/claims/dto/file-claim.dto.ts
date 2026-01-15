import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class FileClaimDto {
  @ApiPropertyOptional({ description: 'Date the claim was received (ISO 8601).' })
  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @ApiPropertyOptional({ description: 'Claim due date (ISO 8601).' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
