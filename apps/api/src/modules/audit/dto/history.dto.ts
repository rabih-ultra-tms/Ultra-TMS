import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class HistoryQueryDto {
  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
