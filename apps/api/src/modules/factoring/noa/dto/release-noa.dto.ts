import { IsOptional, IsString } from 'class-validator';

export class ReleaseNoaDto {
  @IsOptional()
  @IsString()
  releaseReason?: string;
}
