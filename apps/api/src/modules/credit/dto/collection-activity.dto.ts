import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CollectionActivityType } from './enums';

export class CreateCollectionActivityDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsEnum(CollectionActivityType)
  activityType!: CollectionActivityType;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  contactedName?: string;

  @IsOptional()
  @IsString()
  contactedTitle?: string;

  @IsOptional()
  @IsString()
  contactedPhone?: string;

  @IsOptional()
  @IsString()
  contactedEmail?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @IsOptional()
  @IsDateString()
  promisedPaymentDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promisedAmount?: number;
}

export class UpdateCollectionActivityDto extends PartialType(CreateCollectionActivityDto) {}
