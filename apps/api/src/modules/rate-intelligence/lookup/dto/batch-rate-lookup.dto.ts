import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { RateLookupDto } from './rate-lookup.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BatchRateLookupDto {
  @ApiProperty({ type: [RateLookupDto], description: 'Lookup queries' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RateLookupDto)
  queries!: RateLookupDto[];
}
