import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClaimDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @IsString()
  @IsNotEmpty()
  documentType!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
