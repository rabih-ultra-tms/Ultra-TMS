import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateFeatureFlagDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/)
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  defaultEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @IsOptional()
  @IsString()
  owner?: string;
}

export class UpdateFeatureFlagDto extends CreateFeatureFlagDto {}

export class SetFeatureFlagOverrideDto {
  @IsBoolean()
  isEnabled!: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percentage?: number;

  @IsOptional()
  @IsDateString()
  enabledFrom?: string;

  @IsOptional()
  @IsDateString()
  enabledUntil?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
