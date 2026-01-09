import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateDocumentFolderDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentFolderId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}

export class UpdateDocumentFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddDocumentToFolderDto {
  @IsString()
  documentId!: string;
}
