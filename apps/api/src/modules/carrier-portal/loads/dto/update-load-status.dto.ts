import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoadStatusEnum } from '../../../tms/dto/load-query.dto';

export class UpdateLoadStatusDto {
  @ApiProperty({ enum: LoadStatusEnum })
  @IsEnum(LoadStatusEnum)
  status!: LoadStatusEnum;

  @ApiPropertyOptional({ description: 'Status notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Current city' })
  @IsOptional()
  @IsString()
  currentCity?: string;

  @ApiPropertyOptional({ description: 'Current state' })
  @IsOptional()
  @IsString()
  currentState?: string;
}