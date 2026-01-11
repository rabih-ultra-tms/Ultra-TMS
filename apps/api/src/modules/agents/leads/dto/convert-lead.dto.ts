import { IsOptional, IsString } from 'class-validator';

export class ConvertLeadDto {
  @IsString()
  customerId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}