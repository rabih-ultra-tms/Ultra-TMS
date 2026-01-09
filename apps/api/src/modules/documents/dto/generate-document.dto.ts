import { IsString, IsObject } from 'class-validator';

export class GenerateDocumentDto {
  @IsString()
  templateId!: string;

  @IsString()
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsObject()
  dataSnapshot!: Record<string, any>;
}
