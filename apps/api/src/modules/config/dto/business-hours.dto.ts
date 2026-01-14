import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';

export class DayHoursDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  openTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  closeTime?: string;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

export class UpdateBusinessHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayHoursDto)
  days!: DayHoursDto[];

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateHolidayDto {
  @IsString()
  name!: string;

  @IsString()
  date!: string; // ISO date (YYYY-MM-DD)

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  countryCode?: string;
}
