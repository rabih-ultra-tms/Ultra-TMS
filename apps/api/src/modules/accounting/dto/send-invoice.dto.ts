import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class SendInvoiceDto {
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  to?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
