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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgentTerritoryDto {
  @ApiProperty({ description: 'State' })
  @IsString()
  state!: string;

  @ApiPropertyOptional({ description: 'Region' })
  @IsOptional()
  @IsString()
  region?: string;
}

export class CreateAgentDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName!: string;

  @ApiPropertyOptional({ description: 'DBA name' })
  @IsOptional()
  @IsString()
  dbaName?: string;

  @ApiPropertyOptional({ description: 'Legal entity type' })
  @IsOptional()
  @IsString()
  legalEntityType?: string;

  @ApiPropertyOptional({ description: 'Tax ID' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({ description: 'Address line 1' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP' })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Contact first name' })
  @IsString()
  contactFirstName!: string;

  @ApiProperty({ description: 'Contact last name' })
  @IsString()
  contactLastName!: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  contactEmail!: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ enum: AgentType })
  @IsEnum(AgentType)
  agentType!: AgentType;

  @ApiPropertyOptional({ enum: AgentTier })
  @IsOptional()
  @IsEnum(AgentTier)
  tier?: AgentTier;

  @ApiPropertyOptional({ type: [AgentTerritoryDto], description: 'Territories' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentTerritoryDto)
  territories?: AgentTerritoryDto[];

  @ApiPropertyOptional({ type: [String], description: 'Industry focus' })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  industryFocus?: string[];
}