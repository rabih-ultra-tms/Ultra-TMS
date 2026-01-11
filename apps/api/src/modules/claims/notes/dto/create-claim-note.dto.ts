import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClaimNoteDto {
  @IsString()
  @IsNotEmpty()
  note!: string;

  @IsOptional()
  @IsString()
  noteType?: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
