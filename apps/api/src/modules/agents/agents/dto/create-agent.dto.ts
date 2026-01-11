import { AgentTier, AgentType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AgentTerritoryDto {
  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  region?: string;
}

export class CreateAgentDto {
  @IsString()
  companyName!: string;

  @IsOptional()
  @IsString()
  dbaName?: string;

  @IsOptional()
  @IsString()
  legalEntityType?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsString()
  contactFirstName!: string;

  @IsString()
  contactLastName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsEnum(AgentType)
  agentType!: AgentType;

  @IsOptional()
  @IsEnum(AgentTier)
  tier?: AgentTier;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentTerritoryDto)
  territories?: AgentTerritoryDto[];

  @IsOptional()
  @IsArray()
  @Type(() => String)
  industryFocus?: string[];
}