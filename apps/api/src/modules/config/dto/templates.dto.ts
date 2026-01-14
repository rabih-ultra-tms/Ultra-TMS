import { IsOptional, IsString } from 'class-validator';

export class ApplyTemplateDto {
  @IsOptional()
  @IsString()
  targetTenantId?: string;
}
