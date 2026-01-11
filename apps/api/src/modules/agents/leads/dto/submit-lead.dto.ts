import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';

export class SubmitLeadDto {
  @IsString()
  companyName!: string;

  @IsString()
  contactFirstName!: string;

  @IsString()
  contactLastName!: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedMonthlyVolume?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}