import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTenantServiceDto {
  @IsString()
  serviceKey!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateTenantServiceForTenantDto {
  @IsString()
  tenantId!: string;

  @IsString()
  serviceKey!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
