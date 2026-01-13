import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  templateName!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  triggerConfig!: Record<string, unknown>;

  @IsArray()
  stepsJson!: unknown[];

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  stepsJson?: unknown[];

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateFromTemplateDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}

export class TemplateResponseDto {
  id!: string;
  templateName!: string;
  category?: string | null;
  description?: string | null;
  triggerConfig!: Record<string, unknown>;
  stepsJson!: unknown[];
  isSystem!: boolean;
  isActive!: boolean;
  createdAt!: Date;
}

export class TemplateListResponseDto {
  data!: TemplateResponseDto[];
  total!: number;
}
