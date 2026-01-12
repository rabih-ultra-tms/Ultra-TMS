import { IsArray, IsBoolean, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @IsString()
  providerId!: string;

  @IsString()
  accountName!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsObject()
  credentials?: Record<string, string>;

  @IsString()
  companyName!: string;

  @IsString()
  contactPhone!: string;

  @IsOptional()
  @IsString()
  mcNumber?: string;

  @IsOptional()
  @IsString()
  dotNumber?: string;

  @IsOptional()
  @IsBoolean()
  autoPostEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  autoPostDelayMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultAccounts?: string[];
}
