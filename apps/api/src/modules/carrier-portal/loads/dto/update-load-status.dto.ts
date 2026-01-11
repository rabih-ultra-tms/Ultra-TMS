import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LoadStatusEnum } from '../../../tms/dto/load-query.dto';

export class UpdateLoadStatusDto {
  @IsEnum(LoadStatusEnum)
  status: LoadStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  currentCity?: string;

  @IsOptional()
  @IsString()
  currentState?: string;
}