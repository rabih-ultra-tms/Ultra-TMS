import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreditApplicationStatus } from './enums';

export class CreditApplicationQueryDto {
  @IsOptional()
  @IsEnum(CreditApplicationStatus)
  status?: CreditApplicationStatus;

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
