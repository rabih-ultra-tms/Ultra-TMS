import { IsDateString, IsOptional, IsString } from 'class-validator';

export class StartSunsetDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}