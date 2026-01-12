import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PostLoadDto {
  @IsString()
  loadId!: string;

  @IsArray()
  @IsString({ each: true })
  accountIds!: string[];

  @IsOptional()
  @IsString()
  rateType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateAmount?: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  postImmediately?: boolean;
}
