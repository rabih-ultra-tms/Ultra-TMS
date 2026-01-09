import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsObject, IsArray, IsIn } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  name!: string;

  @IsUUID()
  companyId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'])
  stage?: string; // LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST

  @IsOptional()
  @IsNumber()
  probability?: number; // 0-100

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsNumber()
  estimatedLoadsPerMonth?: number;

  @IsOptional()
  @IsNumber()
  avgLoadValue?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsDateString()
  actualCloseDate?: string;

  @IsOptional()
  @IsArray()
  serviceTypes?: string[]; // FTL, LTL, DRAYAGE, etc.

  @IsOptional()
  @IsArray()
  lanes?: Array<{ origin: string; destination: string; volume?: number }>;

  @IsOptional()
  @IsString()
  competition?: string;

  @IsOptional()
  @IsString()
  winReason?: string;

  @IsOptional()
  @IsString()
  lossReason?: string;

  @IsOptional()
  @IsUUID()
  primaryContactId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string; // Will default to current user

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'])
  stage?: string;

  @IsOptional()
  @IsNumber()
  probability?: number;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsNumber()
  estimatedLoadsPerMonth?: number;

  @IsOptional()
  @IsNumber()
  avgLoadValue?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsDateString()
  actualCloseDate?: string;

  @IsOptional()
  @IsArray()
  serviceTypes?: string[];

  @IsOptional()
  @IsArray()
  lanes?: Array<{ origin: string; destination: string; volume?: number }>;

  @IsOptional()
  @IsString()
  competition?: string;

  @IsOptional()
  @IsString()
  winReason?: string;

  @IsOptional()
  @IsString()
  lossReason?: string;

  @IsOptional()
  @IsUUID()
  primaryContactId?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
