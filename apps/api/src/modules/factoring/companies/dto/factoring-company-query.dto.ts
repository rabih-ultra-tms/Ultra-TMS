import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FactoringCompanyStatus } from '../../dto/enums';

export class FactoringCompanyQueryDto {
  @ApiPropertyOptional({ enum: FactoringCompanyStatus })
  @IsOptional()
  @IsEnum(FactoringCompanyStatus)
  status?: FactoringCompanyStatus;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
