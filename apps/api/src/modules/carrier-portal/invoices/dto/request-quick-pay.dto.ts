import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestQuickPayDto {
  @ApiProperty({ description: 'Accept quick pay terms' })
  @IsBoolean()
  acceptTerms!: boolean;
}