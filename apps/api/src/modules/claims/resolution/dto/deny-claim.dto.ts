import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ClaimDisposition } from '@prisma/client';

export class DenyClaimDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsOptional()
  @IsEnum(ClaimDisposition)
  disposition?: ClaimDisposition;
}
