import { IsArray, IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateTransformationDto {
  @IsString()
  templateName!: string;

  @IsString()
  sourceFormat!: string;

  @IsString()
  targetFormat!: string;

  @IsString()
  transformationLogic!: string;

  @IsOptional()
  @IsArray()
  testCases?: Array<Record<string, unknown>>;
}

export class UpdateTransformationDto {
  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsString()
  sourceFormat?: string;

  @IsOptional()
  @IsString()
  targetFormat?: string;

  @IsOptional()
  @IsString()
  transformationLogic?: string;

  @IsOptional()
  @IsArray()
  testCases?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TransformationResponseDto {
  id!: string;
  templateName!: string;
  sourceFormat!: string;
  targetFormat!: string;
  transformationLogic!: string;
  testCases!: Array<Record<string, unknown>>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TransformationListResponseDto {
  data!: TransformationResponseDto[];
  total!: number;
}

export class TransformTestDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  transformationLogic?: string;

  @IsObject()
  sourceData!: Record<string, unknown>;
}

export class TransformTestResponseDto {
  success!: boolean;
  result?: Record<string, unknown>;
  error?: string;
}
