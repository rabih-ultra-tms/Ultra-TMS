import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRetentionPolicyDto {
  @IsString()
  logType!: string;

  @IsInt()
  @Min(1)
  retentionDays!: number;

  @IsOptional()
  @IsBoolean()
  archiveFirst?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  archiveAfterDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  deleteAfterDays?: number;

  @IsOptional()
  @IsString()
  archiveLocation?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRetentionPolicyDto {
  @IsOptional()
  @IsString()
  logType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  retentionDays?: number;

  @IsOptional()
  @IsBoolean()
  archiveFirst?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  archiveAfterDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  deleteAfterDays?: number;

  @IsOptional()
  @IsString()
  archiveLocation?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
