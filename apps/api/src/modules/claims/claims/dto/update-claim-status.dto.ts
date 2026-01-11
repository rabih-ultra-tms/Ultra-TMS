import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '@prisma/client';

export class UpdateClaimStatusDto {
  @IsEnum(ClaimStatus)
  status!: ClaimStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
