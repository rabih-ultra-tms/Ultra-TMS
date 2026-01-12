import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { RateProvider } from '@prisma/client';

export class CreateProviderConfigDto {
  @IsEnum(RateProvider)
  provider!: RateProvider;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsInt()
  dailyQuota?: number;
}
