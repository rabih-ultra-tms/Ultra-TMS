import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitLeadDto {
  @ApiProperty({ description: 'Company name' })
  @IsString()
  companyName!: string;

  @ApiProperty({ description: 'Contact first name' })
  @IsString()
  contactFirstName!: string;

  @ApiProperty({ description: 'Contact last name' })
  @IsString()
  contactLastName!: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Industry' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: 'Estimated monthly volume' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedMonthlyVolume?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}