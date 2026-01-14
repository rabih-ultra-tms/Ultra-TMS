import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsIn, Min, Max } from 'class-validator';

export class InvalidateCacheDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdateRateLimitDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerMinute?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerHour?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerDay?: number;

  @IsOptional()
  @IsIn(['USER', 'TENANT', 'IP', 'GLOBAL'])
  scope?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateInvalidationRuleDto {
  @IsString()
  triggerEvent: string;

  @IsString()
  cachePattern: string;

  @IsIn(['DELETE', 'REFRESH'])
  invalidationType: string;
}

export class UpdateCacheConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(86400)
  ttlSeconds?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
