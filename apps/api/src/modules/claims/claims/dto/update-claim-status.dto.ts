import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '@prisma/client';

export class UpdateClaimStatusDto {
  @ApiProperty({ enum: ClaimStatus, description: 'New status for the claim.' })
  @IsEnum(ClaimStatus)
  status!: ClaimStatus;

  @ApiPropertyOptional({ description: 'Reason for the status update.' })
  @IsOptional()
  @IsString()
  reason?: string;
}
