import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ClaimStatus, ClaimType } from '@prisma/client';

export class QueryClaimsDto {
  @ApiPropertyOptional({ enum: ClaimStatus, description: 'Filter by claim status.' })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiPropertyOptional({ enum: ClaimType, description: 'Filter by claim type.' })
  @IsOptional()
  @IsEnum(ClaimType)
  claimType?: ClaimType;

  @ApiPropertyOptional({ description: 'Filter by carrier identifier.' })
  @IsOptional()
  @IsString()
  carrierId?: string;

  @ApiPropertyOptional({ description: 'Filter by company identifier.' })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Search term to match claims.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ minimum: 1, description: 'Results page number.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, description: 'Maximum results per page.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
