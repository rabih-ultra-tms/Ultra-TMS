import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateNumberSequenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  prefix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  padding?: number;

  @IsOptional()
  @IsBoolean()
  includeYear?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMonth?: boolean;

  @IsOptional()
  @IsString()
  resetFrequency?: string;
}
