import { IsOptional, IsString } from 'class-validator';

export class ReprocessDocumentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
