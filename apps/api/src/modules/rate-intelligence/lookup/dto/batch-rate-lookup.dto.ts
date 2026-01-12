import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RateLookupDto } from './rate-lookup.dto';

export class BatchRateLookupDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateLookupDto)
  queries!: RateLookupDto[];
}
