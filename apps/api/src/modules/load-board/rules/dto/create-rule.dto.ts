import { IsArray, IsBoolean, IsInt, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostingRuleDto {
  @IsString()
  ruleName!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  conditions!: Record<string, unknown>;

  @IsBoolean()
  autoPost!: boolean;

  @IsArray()
  @IsString({ each: true })
  postAccounts!: string[];

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  postDelayMinutes?: number;

  @IsOptional()
  @IsString()
  rateAdjustmentType?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rateAdjustmentValue?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  priority?: number;
}
