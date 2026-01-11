import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ClaimStatus, ClaimType } from '@prisma/client';

export class QueryClaimsDto {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsEnum(ClaimType)
  claimType?: ClaimType;

  @IsOptional()
  @IsString()
  carrierId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
