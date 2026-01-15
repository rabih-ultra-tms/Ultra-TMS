import { PartialType } from '@nestjs/mapped-types';
import { LeadStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubmitLeadDto } from './submit-lead.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAgentLeadDto extends PartialType(SubmitLeadDto) {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}