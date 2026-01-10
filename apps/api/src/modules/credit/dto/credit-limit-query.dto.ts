import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreditLimitStatus } from './enums';

export class CreditLimitQueryDto {
  @IsOptional()
  @IsEnum(CreditLimitStatus)
  status?: CreditLimitStatus;

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
