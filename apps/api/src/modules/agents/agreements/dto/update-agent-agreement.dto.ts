import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentAgreementDto } from './create-agent-agreement.dto';
import { AgreementStatus, CommissionSplitType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAgentAgreementDto extends PartialType(CreateAgentAgreementDto) {
  @ApiPropertyOptional({ enum: AgreementStatus })
  @IsOptional()
  @IsEnum(AgreementStatus)
  status?: AgreementStatus;

  @ApiPropertyOptional({ enum: CommissionSplitType })
  @IsOptional()
  @IsEnum(CommissionSplitType)
  splitType?: CommissionSplitType;

  @ApiPropertyOptional({ description: 'Agreement name' })
  @IsOptional()
  @IsString()
  name?: string;
}