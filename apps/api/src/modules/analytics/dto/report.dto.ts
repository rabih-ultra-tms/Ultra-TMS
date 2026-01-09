import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDateString,
  MaxLength,
  IsObject,
} from 'class-validator';

export enum ReportCategory {
  OPERATIONAL = 'OPERATIONAL',
  FINANCIAL = 'FINANCIAL',
  CARRIER = 'CARRIER',
  CUSTOMER = 'CUSTOMER',
  SALES = 'SALES',
  COMPLIANCE = 'COMPLIANCE',
}

export enum ReportType {
  STANDARD = 'STANDARD',
  CUSTOM = 'CUSTOM',
  AD_HOC = 'AD_HOC',
}

export enum OutputFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
}

export enum TemplateType {
  HTML = 'HTML',
  JASPER = 'JASPER',
  EXCEL = 'EXCEL',
}

export enum ExecutionType {
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL',
  API = 'API',
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CreateReportDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @IsEnum(ReportType)
  reportType!: ReportType;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  dataSource?: string;

  @IsOptional()
  @IsObject()
  queryDefinition?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;

  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  scheduleCron?: string;

  @IsOptional()
  @IsArray()
  recipients?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  queryDefinition?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  recipients?: string[];

  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateScheduleDto {
  @IsBoolean()
  isScheduled!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  scheduleCron?: string;

  @IsOptional()
  @IsDateString()
  nextRunAt?: string;

  @IsOptional()
  @IsArray()
  recipients?: string[];
}

export class ExecuteReportDto {
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;

  @IsOptional()
  @IsEnum(OutputFormat)
  outputFormat?: OutputFormat;

  @IsOptional()
  @IsBoolean()
  sendToRecipients?: boolean;
}

export class CreateReportTemplateDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportCategory)
  category!: ReportCategory;

  @IsEnum(TemplateType)
  templateType!: TemplateType;

  @IsOptional()
  @IsString()
  templateContent?: string;

  @IsOptional()
  @IsObject()
  parametersSchema?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  defaultFilters?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OutputFormat)
  defaultOutputFormat?: OutputFormat;
}

export class UpdateReportTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  templateContent?: string;

  @IsOptional()
  @IsObject()
  parametersSchema?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  defaultFilters?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(OutputFormat)
  defaultOutputFormat?: OutputFormat;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
