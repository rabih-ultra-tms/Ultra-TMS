import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWatchlistDto {
  @IsString()
  carrierId: string;

  @IsString()
  reason: string;

  @IsString()
  riskLevel: string;

  @IsOptional()
  @IsBoolean()
  isRestricted?: boolean;

  @IsOptional()
  @IsString()
  restrictions?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  nextReviewDate?: Date;

  @IsOptional()
  @IsNumber()
  reviewFrequencyDays?: number;
}
