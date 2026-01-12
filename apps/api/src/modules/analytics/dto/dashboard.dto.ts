import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  layout?: unknown;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  layout?: unknown;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class CreateWidgetDto {
  @IsString()
  widgetType!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  configuration?: Record<string, unknown>;

  @IsOptional()
  refreshInterval?: number;

  @IsOptional()
  @IsString()
  kpiDefinitionId?: string;
}

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  configuration?: Record<string, unknown>;

  @IsOptional()
  refreshInterval?: number;

  @IsOptional()
  @IsString()
  kpiDefinitionId?: string;
}
