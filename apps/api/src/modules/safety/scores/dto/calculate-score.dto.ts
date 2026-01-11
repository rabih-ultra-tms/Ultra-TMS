import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CalculateSafetyScoreDto {
  @IsString()
  carrierId: string;

  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean;
}
