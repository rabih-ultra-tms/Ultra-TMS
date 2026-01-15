import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContractType } from '@prisma/client';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  templateName!: string;

  @ApiProperty({ enum: ContractType })
  @IsEnum(ContractType)
  contractType!: ContractType;

  @ApiProperty({ description: 'Template content' })
  @IsString()
  templateContent!: string;

  @ApiPropertyOptional({ description: 'Default terms' })
  @IsOptional()
  @IsString()
  defaultTerms?: string;

  @ApiPropertyOptional({ description: 'Active flag' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
