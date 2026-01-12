import { IsArray, IsOptional, IsString } from 'class-validator';

export class BulkRemoveDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  loadIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accountIds?: string[];
}
