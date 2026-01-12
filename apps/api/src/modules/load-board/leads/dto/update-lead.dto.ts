import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ContactLeadDto } from './contact-lead.dto';

export class UpdateLeadDto extends PartialType(ContactLeadDto) {
  @IsOptional()
  @IsString()
  contactedBy?: string;

  @IsOptional()
  @IsDateString()
  contactedAt?: string;

  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
