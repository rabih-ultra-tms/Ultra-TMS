import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SetTenantConfigDto {
  @IsString()
  key!: string;

  @IsNotEmpty()
  value!: unknown;

  @IsOptional()
  @IsString()
  description?: string;
}

export class BulkUpdateConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetTenantConfigDto)
  configs!: SetTenantConfigDto[];
}
