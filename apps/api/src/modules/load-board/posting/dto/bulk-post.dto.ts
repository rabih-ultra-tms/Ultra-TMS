import { IsArray, IsOptional, IsString } from 'class-validator';

export class BulkPostDto {
  @IsArray()
  @IsString({ each: true })
  loadIds!: string[];

  @IsArray()
  @IsString({ each: true })
  accountIds!: string[];

  @IsOptional()
  @IsString()
  rateType?: string;
}
