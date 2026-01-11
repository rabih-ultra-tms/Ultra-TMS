import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ClaimDisposition } from '@prisma/client';

export class ApproveClaimDto {
  @IsNumber()
  @Min(0)
  approvedAmount!: number;

  @IsOptional()
  @IsEnum(ClaimDisposition)
  disposition?: ClaimDisposition;

  @IsOptional()
  @IsNotEmpty()
  notes?: string;
}
