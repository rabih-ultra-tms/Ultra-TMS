import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ContactLeadDto {
  @IsOptional()
  @IsString()
  contactedBy?: string;

  @IsOptional()
  @IsDateString()
  contactedAt?: string;

  @IsOptional()
  @IsString()
  followUpNotes?: string;
}
