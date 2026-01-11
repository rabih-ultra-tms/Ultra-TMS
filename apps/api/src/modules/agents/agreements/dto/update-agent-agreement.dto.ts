import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentAgreementDto } from './create-agent-agreement.dto';
import { AgreementStatus, CommissionSplitType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateAgentAgreementDto extends PartialType(CreateAgentAgreementDto) {
  @IsOptional()
  @IsEnum(AgreementStatus)
  status?: AgreementStatus;

  @IsOptional()
  @IsEnum(CommissionSplitType)
  splitType?: CommissionSplitType;

  @IsOptional()
  @IsString()
  name?: string;
}