import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  MaxLength,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export enum DashboardOwnerType {
  SYSTEM = 'SYSTEM',
  ROLE = 'ROLE',
  USER = 'USER',
}

export enum DashboardTheme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export enum WidgetType {
  KPI_CARD = 'KPI_CARD',
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  DONUT_CHART = 'DONUT_CHART',
  AREA_CHART = 'AREA_CHART',
  TABLE = 'TABLE',
  MAP = 'MAP',
  GAUGE = 'GAUGE',
  SPARKLINE = 'SPARKLINE',
  TREND = 'TREND',
  LIST = 'LIST',
}

export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MaxLength(100)
  slug!: string;

  @IsEnum(DashboardOwnerType)
  ownerType!: DashboardOwnerType;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsArray()
  layout?: unknown[];

  @IsOptional()
  @IsEnum(DashboardTheme)
  theme?: DashboardTheme;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  refreshInterval?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  layout?: unknown[];

  @IsOptional()
  @IsEnum(DashboardTheme)
  theme?: DashboardTheme;

  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(3600)
  refreshInterval?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class CreateWidgetDto {
  @IsEnum(WidgetType)
  widgetType!: WidgetType;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  positionX?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  positionY?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  height?: number;

  @IsObject()
  dataConfig!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  displayConfig?: Record<string, unknown>;
}

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  positionX?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  positionY?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  height?: number;

  @IsOptional()
  @IsObject()
  dataConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  displayConfig?: Record<string, unknown>;
}

export class UpdateLayoutDto {
  @IsArray()
  layout!: Array<{
    widgetId: string;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
  }>;
}

export class ShareDashboardDto {
  @IsArray()
  @IsString({ each: true })
  userIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}

export class CloneDashboardDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(100)
  slug!: string;
}
