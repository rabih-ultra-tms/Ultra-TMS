import { PartialType } from '@nestjs/mapped-types';
import { PostLoadDto } from './post-load.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto extends PartialType(PostLoadDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  externalPostId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
