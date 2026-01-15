import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  templateName!: string;

  @ApiPropertyOptional({ description: 'Template category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: Object, description: 'Trigger configuration' })
  @IsObject()
  triggerConfig!: Record<string, unknown>;

  @ApiProperty({ type: [Object], description: 'Workflow steps JSON' })
  @IsArray()
  stepsJson!: unknown[];

  @ApiPropertyOptional({ description: 'System template flag' })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: 'Template active flag' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  templateName?: string;

  @ApiPropertyOptional({ description: 'Template category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: Object, description: 'Trigger configuration' })
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object], description: 'Workflow steps JSON' })
  @IsOptional()
  @IsArray()
  stepsJson?: unknown[];

  @ApiPropertyOptional({ description: 'System template flag' })
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional({ description: 'Template active flag' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFromTemplateDto {
  @ApiProperty({ description: 'Workflow name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Workflow description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: Object, description: 'Template parameters' })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Activate workflow after creation' })
  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}

export class TemplateResponseDto {
  @ApiProperty({ description: 'Template ID' })
  id!: string;
  @ApiProperty({ description: 'Template name' })
  templateName!: string;
  @ApiPropertyOptional({ description: 'Template category' })
  category?: string | null;
  @ApiPropertyOptional({ description: 'Template description' })
  description?: string | null;
  @ApiProperty({ type: Object, description: 'Trigger configuration' })
  triggerConfig!: Record<string, unknown>;
  @ApiProperty({ type: [Object], description: 'Workflow steps JSON' })
  stepsJson!: unknown[];
  @ApiProperty({ description: 'System template flag' })
  isSystem!: boolean;
  @ApiProperty({ description: 'Template active flag' })
  isActive!: boolean;
  @ApiProperty({ description: 'Created at', type: String, format: 'date-time' })
  createdAt!: Date;
}

export class TemplateListResponseDto {
  @ApiProperty({ type: [TemplateResponseDto] })
  data!: TemplateResponseDto[];
  @ApiProperty({ description: 'Total templates' })
  total!: number;
}
