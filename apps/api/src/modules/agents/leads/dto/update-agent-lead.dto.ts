import { PartialType } from '@nestjs/mapped-types';
import { LeadStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubmitLeadDto } from './submit-lead.dto';

export class UpdateAgentLeadDto extends PartialType(SubmitLeadDto) {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}