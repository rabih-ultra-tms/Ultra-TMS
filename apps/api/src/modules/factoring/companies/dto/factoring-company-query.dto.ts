import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FactoringCompanyStatus } from '../../dto/enums';

export class FactoringCompanyQueryDto {
  @IsOptional()
  @IsEnum(FactoringCompanyStatus)
  status?: FactoringCompanyStatus;

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
