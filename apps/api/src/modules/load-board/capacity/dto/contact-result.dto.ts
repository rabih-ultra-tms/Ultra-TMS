import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ContactResultDto {
  @IsOptional()
  @IsBoolean()
  contacted?: boolean;

  @IsOptional()
  @IsBoolean()
  interested?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
