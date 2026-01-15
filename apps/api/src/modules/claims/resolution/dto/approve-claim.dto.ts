import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ClaimDisposition } from '@prisma/client';

export class ApproveClaimDto {
  @ApiProperty({ minimum: 0, description: 'Approved claim amount.' })
  @IsNumber()
  @Min(0)
  approvedAmount!: number;

  @ApiPropertyOptional({ enum: ClaimDisposition, description: 'Disposition applied to the claim.' })
  @IsOptional()
  @IsEnum(ClaimDisposition)
  disposition?: ClaimDisposition;

  @ApiPropertyOptional({ description: 'Optional notes about approval.' })
  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
