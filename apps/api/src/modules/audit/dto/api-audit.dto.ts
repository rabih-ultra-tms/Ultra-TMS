import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ApiAuditQueryDto {
  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  statusFrom?: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(599)
  statusTo?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
