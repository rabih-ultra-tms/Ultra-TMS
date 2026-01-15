import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClaimDisposition } from '@prisma/client';

export class DenyClaimDto {
  @ApiProperty({ description: 'Reason for denying the claim.' })
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @ApiPropertyOptional({ enum: ClaimDisposition, description: 'Disposition applied to the denial.' })
  @IsOptional()
  @IsEnum(ClaimDisposition)
  disposition?: ClaimDisposition;
}
