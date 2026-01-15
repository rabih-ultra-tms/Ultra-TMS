import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CollectionActivityType } from './enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionActivityDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @ApiPropertyOptional({ description: 'Invoice ID' })
  @IsOptional()
  @IsString()
  invoiceId?: string;

  @ApiProperty({ enum: CollectionActivityType })
  @IsEnum(CollectionActivityType)
  activityType!: CollectionActivityType;

  @ApiPropertyOptional({ description: 'Subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Outcome' })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiPropertyOptional({ description: 'Contacted name' })
  @IsOptional()
  @IsString()
  contactedName?: string;

  @ApiPropertyOptional({ description: 'Contacted title' })
  @IsOptional()
  @IsString()
  contactedTitle?: string;

  @ApiPropertyOptional({ description: 'Contacted phone' })
  @IsOptional()
  @IsString()
  contactedPhone?: string;

  @ApiPropertyOptional({ description: 'Contacted email' })
  @IsOptional()
  @IsString()
  contactedEmail?: string;

  @ApiPropertyOptional({ description: 'Follow-up date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ description: 'Follow-up notes' })
  @IsOptional()
  @IsString()
  followUpNotes?: string;

  @ApiPropertyOptional({ description: 'Promised payment date', format: 'date-time', type: String })
  @IsOptional()
  @IsDateString()
  promisedPaymentDate?: string;

  @ApiPropertyOptional({ description: 'Promised amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  promisedAmount?: number;
}

export class UpdateCollectionActivityDto extends PartialType(CreateCollectionActivityDto) {}
