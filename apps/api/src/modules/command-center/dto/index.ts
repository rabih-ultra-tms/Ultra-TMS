import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class CommandCenterQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class AutoMatchDto {
  @IsUUID()
  loadId!: string;
}

export class BulkDispatchDto {
  @IsUUID('4', { each: true })
  loadIds!: string[];

  @IsUUID()
  carrierId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
