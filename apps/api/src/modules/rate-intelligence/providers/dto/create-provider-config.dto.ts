import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RateProvider } from '@prisma/client';

export class CreateProviderConfigDto {
  @ApiProperty({ enum: RateProvider })
  @IsEnum(RateProvider)
  provider!: RateProvider;

  @ApiPropertyOptional({ description: 'API key' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'API secret' })
  @IsOptional()
  @IsString()
  apiSecret?: string;

  @ApiPropertyOptional({ description: 'API endpoint URL' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'Username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Password' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Rate limit per hour' })
  @IsOptional()
  @IsInt()
  rateLimitPerHour?: number;

  @ApiPropertyOptional({
    description: 'Cache duration in minutes',
    default: 60,
  })
  @IsOptional()
  @IsInt()
  cacheDurationMins?: number;

  @ApiPropertyOptional({ description: 'Priority' })
  @IsOptional()
  @IsInt()
  priority?: number;

  @ApiPropertyOptional({ description: 'Daily quota' })
  @IsOptional()
  @IsInt()
  dailyQuota?: number;
}
